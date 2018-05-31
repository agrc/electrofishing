#!/usr/bin/env python
# * coding: utf8 *
'''
migration_155.py

A module that adjusts scale and precision on some float fields
'''

from os.path import dirname, join

import arcpy

equipment_table = 'Equipment'
field_infos = [
    ()
]

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
