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
