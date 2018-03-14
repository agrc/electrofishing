#!/usr/bin/env python
# * coding: utf8 *
'''
migration_73.py
A module that adds a couple domains to tag type
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
domain_name = 'tag_types'

def get_domain_by_name(name, domains):
    domain = [domain for domain in domains if domain.name == name]
    if len(domain) != 1:
        raise('domain not found')

    return domain[0]

def add_if_not_exists(domain, code, value=None):
    if code in domain.codedValues:
        print('skipping {}'.format(code))

        return

    if value is None:
        value = code

    arcpy.management.AddCodedValueToDomain(in_workspace=sde, domain_name=domain_name, code=code, code_description=value)

print('getting domains')
domains = arcpy.da.ListDomains(sde)

print('getting specific domain')
tag_domain = get_domain_by_name(domain_name, domains)

print('adding domains')
add_if_not_exists(tag_domain, 'Need spray dye')
add_if_not_exists(tag_domain, 'OTC')

print('done')
