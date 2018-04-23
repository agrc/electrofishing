#!/usr/bin/env python
# * coding: utf8 *
'''
migration_116.py

A module that updates the Diet:MEASUREMENT field type
'''
from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

table_name = 'Diet'

fldMEASUREMENT = 'MEASUREMENT'
fldTEMP = 'TEMP'

fields = arcpy.ListFields(table_name)
measurement_field = [field for field in fields if field.name == fldMEASUREMENT][0]

updated = measurement_field.type == 'DOUBLE'

if not updated:
    print('updating field type for {}'.format(fldMEASUREMENT))
    arcpy.management.AddField(table_name, fldTEMP, 'SHORT')

    arcpy.management.CalculateField(table_name, fldTEMP, '!{}!'.format(fldMEASUREMENT))

    arcpy.management.DeleteField(table_name, fldMEASUREMENT)

    arcpy.management.AddField(table_name, fldMEASUREMENT, 'DOUBLE')

    arcpy.management.CalculateField(table_name, fldMEASUREMENT, '!{}!'.format(fldMEASUREMENT))

    arcpy.management.DeleteField(table_name, fldTEMP)
