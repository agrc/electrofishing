#!/usr/bin/env python
# * coding: utf8 *
'''
mogration_43.py
A module that adds duration pedal time to equipment
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

table = join(sde, 'EQUIPMENT')
field_name = 'PEDAL_TIME'
fields = arcpy.ListFields(table)

upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding new field')
    arcpy.management.AddField(table, field_name=field_name, field_type='SHORT', field_alias='Duration/Pedal Time in Seconds')

arcpy.RefreshCatalog(sde)
print('done')
