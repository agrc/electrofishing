'''
migration_62.2.py

A module that completes some unfinished business of migration_62.py
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

anode_table = 'Anodes'
equipment_table = 'Equipment'

fldEVENT_ID = 'EVENT_ID'
fldEQUIPMENT_ID = 'EQUIPMENT_ID'

old_relationship_name = 'SamplingEvents_Have_Anodes'
new_relationship_name = 'Equipment_Have_Anodes'


if arcpy.Exists(old_relationship_name):
    print('deleting {} relationship class'.format(old_relationship_name))
    arcpy.management.Delete(old_relationship_name)

equipment_fields = [f.name for f in arcpy.ListFields(equipment_table)]
if fldEQUIPMENT_ID not in equipment_fields:
    print('adding {} to {}'.format(fldEQUIPMENT_ID, equipment_table))
    arcpy.management.AddField(equipment_table, fldEQUIPMENT_ID, 'GUID', field_alias='Equipment ID')

anodes_fields = [f.name for f in arcpy.ListFields(anode_table)]
if fldEVENT_ID in anodes_fields:
    print('deleting {} from {}'.format(fldEVENT_ID, anode_table))
    arcpy.management.DeleteField(anode_table, fldEVENT_ID)

if fldEQUIPMENT_ID not in anodes_fields:
    print('adding {} to {}'.format(fldEQUIPMENT_ID, anode_table))
    arcpy.management.AddField(anode_table, fldEQUIPMENT_ID, 'GUID', field_alias='Equipment ID')

if not arcpy.Exists(new_relationship_name):
    print('adding {} relationship class'.format(new_relationship_name))
    arcpy.management.CreateRelationshipClass('Equipment', anode_table, new_relationship_name,
                                             relationship_type='COMPOSITE',
                                             cardinality='ONE_TO_MANY',
                                             message_direction='BOTH',
                                             origin_primary_key=fldEQUIPMENT_ID,
                                             origin_foreign_key=fldEQUIPMENT_ID)
