#!/usr/bin/env python
# * coding: utf8 *
'''
migration_44.py
A module that adds hard body part collection domain values
'''
from os.path import dirname, join

import arcpy
import domains

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
domain_list = arcpy.da.ListDomains(sde)

domain_name = 'hard_body_part'

try:
    domain = domains.get_domain_by_name(domain_name, domain_list)
except Exception as e:
    print(e)
    print('creating new domain')
    arcpy.management.CreateDomain(sde, domain_name=domain_name, domain_description='the part of the body used', field_type='TEXT', domain_type='CODED')
    domain_list = arcpy.da.ListDomains(sde)
    domain = domains.get_domain_by_name(domain_name, domain_list)

print('adding values')
new_domains = [
    'Scale',
    'Spine',
    'Ray',
    'Cleithrum',
    'Otolith',
    'Other'
]

for code in new_domains:
    domains.add_if_not_exists(domain, sde, code)

print('done')
