#!/usr/bin/env python
# * coding: utf8 *
'''
migration_141.py
A module that moves anode shape from equipment to anodes
'''
from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
field_name = 'ANODE_SHAPE'
old_table_name = 'Equipment'
table_name = 'Anodes'
domain_name = 'anode_shapes'

print('updating table schema')
old_table = join(sde, old_table_name)
table = join(sde, table_name)

fields = arcpy.ListFields(table)
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding anode_shape to new table')
    arcpy.management.AddField(table, field_name=field_name, field_type='TEXT', field_length=10, field_alias='Anode Shape')

    print('assigning domain to field')
    arcpy.management.AssignDomainToField(table, field_name, domain_name)

print('removing original field')
arcpy.management.DeleteField(old_table, ['ANODE_SHAPE'])

arcpy.RefreshCatalog(sde)
print('done')
