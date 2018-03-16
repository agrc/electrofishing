#!/usr/bin/env python
# * coding: utf8 *
'''
migration_45.py
A module that adds observers, weather, and collection time fields and a weather domain
'''
from os.path import dirname, join

import arcpy
import domains

domain_name = 'weather_condition'
table_name = 'SamplingEvents'

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
domain_list = arcpy.da.ListDomains(sde)

print('creating domain')
try:
    domain = domains.get_domain_by_name(domain_name, domain_list)
except Exception as e:
    print(e)
    print('creating new domain')
    arcpy.management.CreateDomain(sde, domain_name=domain_name, domain_description='Weather Conditions', field_type='TEXT', domain_type='CODED')
    domain_list = arcpy.da.ListDomains(sde)
    domain = domains.get_domain_by_name(domain_name, domain_list)

print('adding values')
new_domains = [
    'sunny',
    'partly cloudy',
    'partly sunny',
    'overcast',
    'rain',
    'sleet',
    'snow',
    'clear'
]

for code in new_domains:
    domains.add_if_not_exists(domain, sde, code)

table = join(sde, table_name)
field_name = 'WEATHER'
fields = arcpy.ListFields(table)

upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding new field')
    arcpy.management.AddField(table, field_name=field_name, field_type='TEXT', field_alias='Weather Condition')

    print('assigning domain to field')
    arcpy.management.AssignDomainToField(table, field_name, domain_name)

field_name = 'OBSERVERS'

upgraded = len([field for field in fields if field.name == field_name]) > 0

if not upgraded:
    print('adding new field')
    arcpy.management.AddField(table, field_name=field_name, field_type='TEXT', field_alias='Observers')

arcpy.RefreshCatalog(sde)
print('done')
