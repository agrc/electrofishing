'''
migration_62.py

A module that refactors anode-related fields out of the Equipment table and into a related Anode table
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

anode_table = 'Anodes'
equipment_table = 'Equipment'

fldEVENT_ID = 'EVENT_ID'

fldANODE_DIAMETER = 'ANODE_DIAMETER'
fldSTOCK_DIAMETER = 'STOCK_DIAMETER'

relationship_name = 'SamplingEvents_Have_Anodes'

field_infos = [
    (fldEVENT_ID, 'Event ID', 'GUID'),
    (fldANODE_DIAMETER, 'Anode Diameter: Maximum Opening', 'SHORT'),
    (fldSTOCK_DIAMETER, 'Stock Diameter: X-section of anode stock', 'FLOAT')
]


if not arcpy.Exists(anode_table):
    print('creating {} table'.format(anode_table))
    arcpy.management.CreateTable(sde, anode_table)

existing_anode_fields = [field.name for field in arcpy.ListFields(anode_table)]
for name, alias, type in field_infos:
    if name not in existing_anode_fields:
        print('adding {} field'.format(name))
        arcpy.management.AddField(anode_table, name, type, field_alias=alias)


existing_equipment_fields = [field.name for field in arcpy.ListFields(equipment_table)]

if fldANODE_DIAMETER in existing_equipment_fields and fldSTOCK_DIAMETER in existing_equipment_fields:
    print('moving data from {} to {}'.format(equipment_table, anode_table))
    arcpy.management.TruncateTable(anode_table)
    fields = [fldANODE_DIAMETER, fldSTOCK_DIAMETER]
    with arcpy.da.SearchCursor(equipment_table, fields) as equipment_cursor, \
            arcpy.da.InsertCursor(anode_table, fields) as anode_cursor:
        for row in equipment_cursor:
            anode_cursor.insertRow(row)

    for field in fields:
        print('removing {} from {}'.format(field, equipment_table))
        arcpy.management.DeleteField(equipment_table, field)

if not arcpy.Exists(relationship_name):
    print('creating {} relationship class'.format(relationship_name))
    arcpy.management.CreateRelationshipClass('SamplingEvents', anode_table, relationship_name,
                                             relationship_type='COMPOSITE',
                                             cardinality='ONE_TO_MANY',
                                             message_direction='BOTH',
                                             origin_primary_key=fldEVENT_ID,
                                             origin_foreign_key=fldEVENT_ID)
