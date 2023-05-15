#!/usr/bin/env python
# * coding: utf8 *
'''
migration_313.py

A module that converts a few fields in the Habitat table to floats

Ref: https://github.com/agrc/electrofishing/issues/313
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = r'...'
table = 'Habitat'

def change_field(field, alias):
    print('adding temp field')
    arcpy.management.AddField(table, field_name='TEMP', field_type='SHORT')
    print('copying values to temp field')
    arcpy.management.CalculateField(table, 'TEMP', f'!{field}!', 'PYTHON3')
    print(f'deleting {field}')
    arcpy.management.DeleteField(table, field)
    print('adding new field')
    arcpy.management.AddField(table, field_name=field, field_type='FLOAT', field_alias=alias)
    print('copying values to new field')
    arcpy.management.CalculateField(table, field, '!TEMP!', 'PYTHON3')
    print('deleting temp field')
    arcpy.management.DeleteField(table, 'TEMP')


fields = [
    ('CON', 'Conductivity'),
    ('OXYGEN', 'Dissolved Oxygen (mg/l)'),
    ('SOLIDS', 'Total Dissolved Solids (ppm)'),
    ('TURBIDITY', 'Turbidity'),
    ('ALKALINITY', 'Alkalinity (ppm CaCO3)'),
]

for field, alias in fields:
    change_field(field, alias)

