'''
migration_72.py

A module that adds a new field to the Tags table
'''
from os.path import dirname, join

import arcpy
import domains

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')

table_name = 'Tags'

fldFREQUENCY = 'FREQUENCY'
fldTRANSPONDER_FREQ = 'TRANSPONDER_FREQ'
fldTRANSMITTER_FREQ = 'TRANSMITTER_FREQ'
fldTRANSMITTER_FREQ_TYPE = 'TRANSMITTER_FREQ_TYPE'

Acoustic = 'Acoustic'
tag_types = 'tag_types'
frequency_types = 'frequency_types'
frequency_types_values = ['kHz', 'MHz']

fields = arcpy.ListFields(table_name)
upgraded = fldTRANSPONDER_FREQ in [field.name for field in fields]

if not upgraded:
    print('adding {}'.format(fldTRANSPONDER_FREQ))
    arcpy.management.AddField(table_name,
                              field_name=fldTRANSPONDER_FREQ,
                              field_type='TEXT',
                              field_alias='Transponder Frequency (kHz)',
                              field_length=4,
                              field_domain='tag_frequencies')
    arcpy.management.CalculateField(table_name, fldTRANSPONDER_FREQ, '!{}!'.format(fldFREQUENCY), 'PYTHON')

    print('removing {}'.format(fldFREQUENCY))
    arcpy.management.DeleteField(table_name, fldFREQUENCY)

print('adding: {} to {}'.format(Acoustic, tag_types))
existing_domains = arcpy.da.ListDomains(sde)
domains.add_if_not_exists(domains.get_domain_by_name(tag_types, existing_domains), sde, Acoustic, Acoustic)

upgraded = fldTRANSMITTER_FREQ in [field.name for field in fields]
if not upgraded:
    print('adding {}'.format(fldTRANSMITTER_FREQ))
    arcpy.management.AddField(table_name,
                              field_name=fldTRANSMITTER_FREQ,
                              field_type='SHORT',
                              field_alias='Transmitter Frequency')

upgraded = fldTRANSMITTER_FREQ_TYPE in [field.name for field in fields]
if not upgraded:
    arcpy.management.CreateDomain(sde, frequency_types, domain_description='Frequency Types',
                                  field_type='TEXT', domain_type='CODED')

    existing_domains = arcpy.da.ListDomains(sde)
    new_domain = domains.get_domain_by_name(frequency_types, existing_domains)
    for value in frequency_types_values:
        domains.add_if_not_exists(new_domain, sde, value)

    print('adding {}'.format(fldTRANSMITTER_FREQ_TYPE))
    arcpy.management.AddField(table_name,
                              field_name=fldTRANSMITTER_FREQ_TYPE,
                              field_type='TEXT',
                              field_alias='Transmitter Frequency Type',
                              field_length=3,
                              field_domain=frequency_types)
