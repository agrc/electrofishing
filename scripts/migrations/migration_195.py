'''
migration_195.py

A module that adds fields, relationship classes and data to enable linking between
stations and streams/lakes data.

Accepts a single argument which is a path to the fgdb containing the lakes & streams data.
'''

from os.path import dirname, join
from sys import argv

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), '..', 'Scripts', 'settings', 'ELECTROFISHING_Test as WildAdmin.sde')

#: add WATER_ID field to stations
water_id_field = 'WATER_ID'

if water_id_field not in [field.name for field in arcpy.Describe('Stations').fields]:
    print('adding {} field'.format(water_id_field))
    arcpy.management.AddField('Stations', water_id_field, field_type='TEXT', field_length=40)

#: import lakes & streams data
fgdb = argv[1]
county_field = 'COUNTY'
for dataset in ['UDWRLakes', 'UDWRStreams']:
    if not arcpy.Exists(dataset):
        print('copying ' + dataset)
        arcpy.management.Copy(join(fgdb, dataset), dataset)

    if county_field not in [field.name for field in arcpy.Describe(dataset).fields]:
        print('adding {} field'.format(county_field))
        arcpy.management.AddField(dataset, county_field, field_type='TEXT', field_length=15)

#: relationship classes
permanent_identifier_field = 'Permanent_Identifier'
def addRelationshipClass(name, primary_key, foreign_key, dataset):
    if arcpy.Exists(name):
        return

    arcpy.management.CreateRelationshipClass('Stations', dataset, name,
                                             relationship_type='SIMPLE',
                                             cardinality='ONE_TO_ONE',
                                             message_direction='BOTH',
                                             origin_primary_key=primary_key,
                                             origin_foreign_key=foreign_key)

addRelationshipClass('Stations_Have_Lakes', water_id_field, permanent_identifier_field, 'UDWRLakes')
addRelationshipClass('Stations_Have_Streams', water_id_field, permanent_identifier_field, 'UDWRStreams')
