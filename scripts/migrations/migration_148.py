#!/usr/bin/env python
# * coding: utf8 *
'''
migration_148.py

A module that removes the VEGD field from the Habitat table
'''
from os.path import dirname, join

import arcpy

habitat_table_name = 'Habitat'
fldVEGD = 'VEGD'
arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

fields = [field.name for field in arcpy.ListFields(habitat_table_name)]

if fldVEGD in fields:
    print('removing {} from {}'.format(fldVEGD, habitat_table_name))
    arcpy.management.DeleteField(habitat_table_name, fldVEGD)
