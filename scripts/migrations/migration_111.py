#!/usr/bin/env python
# * coding: utf8 *
'''
migration_111.py
A module that adds moves survey purpose from equipment to location
'''
from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
old_table_name = 'Equipment'
table_name = 'SamplingEvents'
field_name = 'SURVEY_PURPOSE'
domain_name = 'survey_purpose'

print('updating table schema')
old_table = join(sde, old_table_name)
table = join(sde, table_name)

fields = arcpy.ListFields(old_table)
upgraded = len([field for field in fields if field.name == field_name]) > 0

if upgraded:
    print('deleting from old table')
    arcpy.management.DeleteField(old_table, [field_name])

fields = arcpy.ListFields(table)
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding to new table')
    arcpy.management.AddField(table, field_name=field_name, field_type='TEXT', field_alias='Survey Purpose')

    print('assigning domain to field')
    arcpy.management.AssignDomainToField(table, field_name, domain_name)

arcpy.RefreshCatalog(sde)
print('done')
