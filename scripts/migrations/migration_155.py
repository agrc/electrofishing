#!/usr/bin/env python
# * coding: utf8 *
'''
migration_155.py

A module that adjusts scale and precision on some float fields
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')


def recreate_field(table, field_infos):
    fields = [field[0] for field in field_infos]
    print('deleting {} from {}'.format(fields, table))
    arcpy.management.DeleteField(table, fields)

    for field_name, alias, precision, scale in field_infos:
        print('adding {}'.format(field_name))
        arcpy.management.AddField(table, field_name=field_name, field_type='FLOAT', field_precision=precision, field_scale=scale, field_alias=alias)


table_name = 'Equipment'
field_infos = [
    ('VOLTAGE', 'Voltage', 5, 6),  #: min 0, max 1000, steps .01
    ('AMPS', 'Amps', 4, 1),  #: min 0, max 150, steps .1
    ('CATHODE_LEN', 'Cathode Length', 5, 2),  #: min 1, max 305, steps .01
    ('CATHODE_DIAMETER', 'Cathode Diameter', 3, 2),  #: min 0.1, max 2.54 steps .01
]

recreate_field(table_name, field_infos)

table_name = 'Habitat'
field_infos = [
    ('DEPMAX', 'Maximum Depth', 4, 1),  #: min 0, max 1000, steps 1. can't be 0, that's invalid. This should be an int?
    ('WWID', 'Wetted Width', 6, 2),  #: min 0, max 1000, steps .01
    ('VEL', 'Water Velocity', 2, 1),  #: min 0, max 10, steps 1
    ('TEMP', 'Water Temperature', 5, 2),  #: min 0.00, max 100 steps .01
    ('PH', 'pH', 3, 1),  #: min 0, max 14 steps .1
]

recreate_field(table_name, field_infos)
