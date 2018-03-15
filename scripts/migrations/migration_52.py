#!/usr/bin/env python
# * coding: utf8 *
'''
migration_52.py
A module that adds units of measurement to diet_measurement_type
'''
from os.path import dirname, join

import arcpy
import domains

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
domain_name = 'diet_measurement_type'
old_domains = "'v: Volume';'w: Weight'"

print('getting domains')
domain_list = arcpy.da.ListDomains(sde)

domain = domains.get_domain_by_name(domain_name, domain_list)

print('deleting domains')
domains.delete_domains(domain_name, old_domains, sde)

print('adding domains')
domains.add_if_not_exists(domain, sde, 'v', 'Volume (ml)')
domains.add_if_not_exists(domain, sde, 'w', 'Weight (g)')

print('updating table schema')
table = join(sde, 'Diet')

arcpy.management.DeleteField(table, ['MEASUREMENT'])
arcpy.management.AddField(table, field_name='MEASUREMENT', field_type='SHORT', field_alias='Measurement')

print('done')
