#!/usr/bin/env python
# * coding: utf8 *
'''
ImportStreamsLakesData.py

A module that imports streams and lakes feature classes from a local file geodatabase into
the electrofishing SDE database. Part of the import process is adding a COUNTY field
to act as a context value for the stream search tool.
'''

import arcpy
from os.path import dirname, join
import sys


def import_data(import_gdb, destination_sde, counties):
    arcpy.env.workspace = destination_sde
    county_field_name = 'COUNTY'

    for fc in ['UDWRLakes', 'UDWRStreams']:
        print(fc)
        destination = join(destination_sde, fc)

        print('truncating sde data')
        arcpy.management.DeleteFeatures(destination)

        print('appending data')
        arcpy.management.Append(join(import_gdb, fc), destination, "NO_TEST")

        print('spatial join')
        spatial_join = arcpy.analysis.SpatialJoin(fc, counties, r'in_memory\{}'.format(fc))

        existing_fields = [field.name for field in arcpy.Describe(fc).fields]
        if county_field_name not in existing_fields:
            print('adding field')
            arcpy.management.AddField(fc, county_field_name, 'TEXT', None, None, 15)

        print('making layer')
        layer = arcpy.management.MakeFeatureLayer(fc)

        print('adding join')
        joined = arcpy.management.AddJoin(layer, 'OBJECTID', spatial_join, 'TARGET_FID')

        print('calculating field')
        arcpy.management.CalculateField(joined, county_field_name, '!NAME!', 'PYTHON')


if __name__ == '__main__':
    import_data(sys.argv[1], sys.argv[2], sys.argv[3])
