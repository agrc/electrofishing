#!/usr/bin/env python
# * coding: utf8 *
'''
migration_141.py
A module that moves anode shape from equipment to anodes
'''
from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
table_name = 'Stations'
table = join(sde, table_name)

field_infos = [
  ['WATERBODY', 'Waterbody Name', 50],
  ['WATERBODY_ID', 'Waterbody ID', 25],
  ['REACH_CODE', 'Reach Code', 14]
]

fields = arcpy.ListFields(table)

for name, alias, length in field_infos:
  upgraded = len([field for field in fields if field.name == name]) > 0
  if not upgraded:
    print('adding {} to {}'.format(name, table_name))
    arcpy.management.AddField(table,
                              field_name=name,
                              field_alias=alias,
                              field_type='TEXT',
                              field_length=length)

arcpy.RefreshCatalog(sde)
print('done')
