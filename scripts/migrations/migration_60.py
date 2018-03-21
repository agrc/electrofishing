#!/usr/bin/env python
# * coding: utf8 *
'''
migration_60.py
A module that adds new fields and domain values
backwater area, Dissolved Oxygen (mg/l), Total Dissolved Solids (ppm),
Turbidity (cm), Alkalinity (ppm CaCO3)
Sediment Class Percentages section > Add Bedrock
rename acidity to pH store as a double
'''
from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

table_name = 'Habitat'
field_name = 'PH'

print('altering acidity alias')
table = join(sde, table_name)
arcpy.management.AlterField(table, field_name, new_field_alias='pH')

fields = arcpy.ListFields(table)
field_name = 'SUB_BEDR'
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding {}'.format(field_name))
    arcpy.management.AddField(table, field_name=field_name, field_type='SHORT', field_alias='Percentage of Bedrock Sediment Class')

field_name = 'OXYGEN'
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding {}'.format(field_name))
    arcpy.management.AddField(table, field_name=field_name, field_type='SHORT', field_alias='Dissolved Oxygen (mg/l)')

field_name = 'SOLIDS'
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding {}'.format(field_name))
    arcpy.management.AddField(table, field_name=field_name, field_type='SHORT', field_alias='Total Dissolved Solids (ppm)')

field_name = 'TURBIDITY'
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding {}'.format(field_name))
    arcpy.management.AddField(table, field_name=field_name, field_type='SHORT', field_alias='Turbidity')

field_name = 'ALKALINITY'
upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding {}'.format(field_name))
    arcpy.management.AddField(table, field_name=field_name, field_type='SHORT', field_alias='Alkalinity (ppm CaCO3)')
