#!/usr/bin/env python
# * coding: utf8 *
'''
delete_all_domains.py
A module that deletes all domain values

when importing a schema xml, domains can get _1's instead of being replaced.
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

domain_list = arcpy.da.ListDomains(sde)
for domain in domain_list:
    print('deleting {0}', domain.name)
    arcpy.management.DeleteDomain(sde, domain.name)
