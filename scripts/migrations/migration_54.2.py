'''
migration_54.2.py

A module that migrates from fields from the Transect table to a new table called TransectMeasurements
'''


from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')


transect_table = 'Transect'
measurements_table = 'TransectMeasurements'

relationship_name = 'Transects_Have_TransectMeasurements'

fldTRANSECT_ID = 'TRANSECT_ID'
fldTRANSECT_NUM = 'TRANSECT_NUM'


transect_fields = [f.name for f in arcpy.ListFields(transect_table)]
if fldTRANSECT_ID not in transect_fields:
    print('adding {} to {}'.format(fldTRANSECT_ID, transect_table))
    arcpy.management.AddField(transect_table, fldTRANSECT_ID, 'GUID', field_alias='Transect ID')
if fldTRANSECT_NUM not in transect_fields:
    print('adding {} to {}'.format(fldTRANSECT_NUM, transect_table))
    arcpy.management.AddField(transect_table, fldTRANSECT_NUM, 'SHORT', field_alias='Transect Number')

migrate_fields = [
    ('DEPTH', 'Depth', 'DOUBLE', None, None),
    ('VELOCITY', 'Velocity', 'DOUBLE', None, None),
    ('SUBSTRATE', 'Substrate', 'TEXT', 10, 'substrate_types'),
    ('DISTANCE_START', 'Distance from starting bank', 'DOUBLE', None, None)
]

if not arcpy.Exists(measurements_table):
    print('creating ' + measurements_table)
    arcpy.management.CreateTable(sde, measurements_table)

measurement_fields = [f.name for f in arcpy.ListFields(measurements_table)]
if fldTRANSECT_ID not in measurement_fields:
    print('adding {} to {}'.format(fldTRANSECT_ID, measurements_table))
    arcpy.management.AddField(measurements_table, fldTRANSECT_ID, 'GUID', field_alias='Transect ID')

for name, alias, type, length, domain in migrate_fields:
    if name in transect_fields:
        print('removing {} from {}'.format(name, transect_table))
        arcpy.management.DeleteField(transect_table, name)

    if name not in measurement_fields:
        print('adding {} to {}'.format(name, measurements_table))
        arcpy.management.AddField(measurements_table, name, type, field_length=length, field_alias=alias, field_domain=domain)

if not arcpy.Exists(relationship_name):
    print('creating {} relationship class'.format(relationship_name))
    arcpy.management.CreateRelationshipClass(transect_table, measurements_table, relationship_name,
                                             relationship_type='COMPOSITE',
                                             cardinality='ONE_TO_MANY',
                                             message_direction='BOTH',
                                             origin_primary_key=fldTRANSECT_ID,
                                             origin_foreign_key=fldTRANSECT_ID)
