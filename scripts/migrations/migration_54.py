'''
migration_54.py

A module that migrates some fields from the Habitat table to a new Transect table
'''

from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')


transect_table = 'Transect'
habitat_table = 'Habitat'

relationship_name = 'SamplingEvents_Have_Transects'

substrate_domain_name = 'substrate_types'
starting_bank_domain_name = 'starting_bank_types'

fldEVENT_ID = 'EVENT_ID'

domains = [
    (substrate_domain_name, 'Substrate Types', ['Fines', 'Sand', 'Gravel', 'Cobble', 'Rubble', 'Boulder', 'Bedrock']),
    (starting_bank_domain_name, 'Starting banks', ['River Right', 'River Left'])
]

#: fields to be added to Transect table
transect_fields = [
    ('EVENT_ID', 'Event ID', 'GUID', None, None),
    ('DEPTH', 'Depth', 'DOUBLE', None, None),
    ('VELOCITY', 'Velocity', 'DOUBLE', None, None),
    ('SUBSTRATE', 'Substrate', 'TEXT', 10, substrate_domain_name),
    ('DISTANCE_START', 'Distance from starting bank', 'DOUBLE', None, None),
    ('BWID', 'Bankfull width', 'DOUBLE', None, None),
    ('WWID', 'Wetted width', 'DOUBLE', None, None),
    ('STARTING_BANK', 'Starting bank', 'TEXT', 12, starting_bank_domain_name)
]


#: to be removed from Habitat
fields_remove = ['DEPTR', 'DEPTL', 'DEPM', 'BWID']

field_type_updates = [
    ('SOLIDS', 'DOUBLE'),
    ('TURBIDITY', 'DOUBLE'),
    ('ALKALINITY', 'DOUBLE'),
    ('CON', 'DOUBLE')
]

#: add domains
existing_domain_names = [domain.name for domain in arcpy.da.ListDomains(sde)]
for domain_name, domain_alias, values in domains:
    if domain_name not in existing_domain_names:
        print('adding {} domain'.format(domain_name))
        arcpy.management.CreateDomain(sde, domain_name, domain_alias, 'TEXT')
        for value in values:
            arcpy.management.AddCodedValueToDomain(sde, domain_name, value, value)


#: create transect table
if not arcpy.Exists(transect_table):
    print('creating {} table'.format(transect_table))
    arcpy.management.CreateTable(sde, transect_table)

existing_fields = [field.name for field in arcpy.ListFields(transect_table)]
if len(existing_fields) < 9:
    for name, alias, type, length, domain_name in transect_fields:
        if name not in existing_fields:
            arcpy.management.AddField(transect_table, name, type, field_length=length, field_alias=alias, field_domain=domain_name)

#: remove old fields from habitat table
existing_fields = [field.name for field in arcpy.ListFields(habitat_table)]
for field_name in fields_remove:
    if field_name in existing_fields:
        print('removing {} from {}'.format(field_name, habitat_table))
        arcpy.management.DeleteField(habitat_table, field_name)

#: create relationship class
if not arcpy.Exists(relationship_name):
    print('creating {} relationship class'.format(relationship_name))
    arcpy.management.CreateRelationshipClass('SamplingEvents', transect_table, relationship_name,
                                             relationship_type='COMPOSITE',
                                             cardinality='ONE_TO_MANY',
                                             message_direction='BOTH',
                                             origin_primary_key=fldEVENT_ID,
                                             origin_foreign_key=fldEVENT_ID)
