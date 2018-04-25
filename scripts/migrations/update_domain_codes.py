'''
update_domain_codes.py

A module that overwrites all of the domain codes with their associated descriptions.
It also adjusts field lengths if needed.
'''

from copy import copy
from json import dumps
from os.path import dirname, join
from textwrap import dedent

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
datasets = arcpy.ListTables() + arcpy.ListFeatureClasses()

domains_in_data = {}


print('finding domains and their relationship to data')
for dataset in datasets:
    print('\n' + dataset)
    for field in arcpy.ListFields(dataset):
        if len(field.domain) == 0 or field.type != 'String':
            continue

        print(field.name)

        domains_in_data.setdefault(field.domain, []).append((dataset, field))

#: look for orphaned domains
all_domains = [domain for domain in arcpy.da.ListDomains() if domain.domainType == 'CodedValue']
all_domain_names = set(domain.name for domain in all_domains)
used_domains = set(domains_in_data.keys())


orphans = all_domain_names - used_domains

if len(orphans) > 0:
    print('orphans: {}'.format(orphans))

domains_lu = {}
for domain in all_domains:
    domains_lu[domain.name] = domain

print('\nOverwriting domain codes with descriptions.')
for domain_name in domains_in_data:
    print(domain_name)

    domain = domains_lu[domain_name]

    #: delete all values in domain
    coded_values = copy(domain.codedValues)
    arcpy.management.DeleteCodedValueFromDomain(sde, domain_name, [*coded_values.keys()])

    #: add all values back with the description as the code
    max_length = 0
    descriptions = [*coded_values.values()]
    for description in descriptions:
        arcpy.management.AddCodedValueToDomain(sde, domain_name, description, description)
        length = len(description)
        if max_length < length:
            max_length = length

    arcpy.management.SortCodedValueDomain(sde, domain_name, 'CODE', 'ASCENDING')

    for dataset, field in domains_in_data[domain_name]:
        if field.length < max_length:
            print('updating length of {} to {}'.format(field.name, max_length))
            arcpy.management.AlterField(dataset, field.name, field_length=max_length)

        #: translate codes into descriptions in data
        print('calculating new values')
        code_block = dedent("""
            from json import loads
            lookup = loads('{}')
        """.format(dumps(coded_values)))
        arcpy.management.CalculateField(dataset, field.name, 'lookup[!{}!]'.format(field.name), code_block=code_block)
