#!/usr/bin/env python
# * coding: utf8 *
'''
migration_73.py
A module that adds a couple domain_list to tag type
'''

from os.path import dirname, join

import arcpy
import domains

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
domain_name = 'tag_types'

print('getting domains')
domain_list = arcpy.da.ListDomains(sde)

print('getting specific domain')
tag_domain = domains.get_domain_by_name(domain_name, domain_list)

domains.delete_if_exists(tag_domain, sde, 'Need spray dye')

print('adding domains')
domains.add_if_not_exists(tag_domain, sde, 'Spray dye')
domains.add_if_not_exists(tag_domain, sde, 'OTC')

arcpy.RefreshCatalog(sde)
print('done')
