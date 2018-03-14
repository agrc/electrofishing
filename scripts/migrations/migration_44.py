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

print('creating new domain')
domain_name = 'hard_body_part'
arcpy.management.CreateDomain(sde, domain_name=domain_name, domain_description='the part of the body used', field_type='TEXT', domain_type='CODED')

print('adding values')
new_domains = [
    ('Scale',)
    ('Spine',)
    ('Ray',)
    ('Cleithrum',)
    ('Otolith',)
    ('Other',)
]
domains.add_values_to_domain(domain_name, new_domains, sde)

print('done')
