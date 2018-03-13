#!/usr/bin/env python
# * coding: utf8 *
'''
Domains.py
A module that helps with domain stuff
'''

import pdb
from os.path import dirname, join

import arcpy

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
dominant_overstory = [
    ('as', 'Alkali sacaton'),
    ('ap', 'Anderson peachbush'),
    ('ae', 'Autum eleagus'),
    ('bbs', 'Basin big sagebrush'),
    ('bc', 'Bessy cherry'),
    ('bl', 'Bladdersenia'),
    ('br', 'Bulrush'),
    ('bcf', 'Bush cinquefoil'),
    ('car', 'Carex'),
    ('cs', 'Cattle saltbrush'),
    ('cmf', 'Creeping meadow foxtail'),
    ('cp', 'Desert peachbush'),
    ('dog', 'Dogwood'),
    ('dh', 'Douglas hawthorn'),
    ('fs', 'Fourwing saltbrush'),
    ('gbw', 'Great Basin wildrye'),
    ('iw', 'Intermediate wheatgrass'),
    ('kb', 'Kentucky bluegrass'),
    ('la', 'Leadplant amorpha'),
    ('ls', 'Longflower snowberry'),
    ('mw', 'Mammoth wildrye'),
    ('mbs', 'Mountain big sagebrush'),
    ('mr', 'Mountain rye'),
    ('ms', 'Mountain snowberry'),
    ('ow', 'Oldman wormwood'),
    ('pc', 'Pecking catoneaster'),
    ('pp', 'Pygmy peashrub'),
    ('rcg', 'Reed canary grass'),
    ('rh', 'River hawthorn'),
    ('rms', 'Rocky Mountain sumac'),
    ('rr', 'Rubber rabbitbrush'),
    ('rush', 'Rush'),
    ('ss', 'Sand sagebrush'),
    ('sb', 'Sandberg bluegrass'),
    ('sbuf', 'Silver buffaloberry'),
    ('ssage', 'Silver sagebrush'),
    ('s', 'Spikerush'),
    ('to', 'Tall oatgrass'),
    ('tw', 'Tall wheatgrass'),
    ('th', 'Tetarian honeysuckle'),
    ('ts', 'Torrey saltbrush'),
    ('uh', 'Utah honeysuckle'),
    ('ws', 'Westerm snowberry'),
    ('wvb', 'Western virgin bower'),
    ('ww', 'Western wheatgrass'),
    ('wbs', 'Wyoming big sagebrush')
]

dominant_understory = [
    ('ap', 'American plum'),
    ('bs', 'Big saltbrush'),
    ('btm', 'Big tooth maple'),
    ('be', 'Blueberry elder'),
    ('cg', 'Canyon grape'),
    ('cp', 'Carolina poplar'),
    ('cc', 'Chokecherry'),
    ('dw', 'Desert willow'),
    ('eb', 'Emory bacharis'),
    ('fc', 'Fremont cottonwood'),
    ('go', 'Gamble oak'),
    ('gc', 'Golden currant'),
    ('gr', 'Greasewood'),
    ('hack', 'Hackberry'),
    ('hc', 'Hopa crabapple'),
    ('lil', 'Lilac'),
    ('ma', 'Mountain ash'),
    ('nc', 'Narrowleaf cottonwood'),
    ('nml', 'New Mexico locust'),
    ('rt', 'Redtop'),
    ('rmm', 'Rocky Mountain maple'),
    ('rm', 'Russian mulberry'),
    ('ss', 'Saskatoon serviceberry'),
    ('slo', 'Shrub live oak'),
    ('sp', 'Siberian peashrub'),
    ('sbs', 'Skunk bush sumac'),
    ('wb', 'Water birch'),
    ('wil', 'Willow'),
    ('wr', 'Woods rose')
]

def get_domain_by_name(name, domains):
    domain = [domain for domain in domains if domain.name == name]
    if len(domain) != 1:
        raise('domain not found')

    return domain[0]

def get_codes_formatted_for_delete(coded_values):
    domain_string = []

    for code, value in coded_values.iteritems():
        domain_string.append("'{}: {}'".format(code, value))

    code = ';'.join(domain_string)

    return code

def delete_domains(name, codes):
    if codes == '':
        return

    arcpy.management.DeleteCodedValueFromDomain(in_workspace=sde, domain_name=name, code=codes)

def add_values_to_domain(name, code_value_pairs):
    for code, value in code_value_pairs:
        arcpy.management.AddCodedValueToDomain(in_workspace=sde, domain_name=name, code=code, code_description=value)

print('getting domains')
domains = arcpy.da.ListDomains(sde)

print('getting dominant domains')
dominant_overstories = get_domain_by_name('dominant_overstories', domains)
dominant_understories = get_domain_by_name('dominant_understories', domains)

print('preparing delete')
overstory_codes = get_codes_formatted_for_delete(dominant_overstories.codedValues)
understory_codes = get_codes_formatted_for_delete(dominant_understories.codedValues)

print('deleting domains')
delete_domains('dominant_overstories', overstory_codes)
delete_domains('dominant_understories', understory_codes)

print('populating domains')
add_values_to_domain('dominant_overstories', dominant_overstory)
add_values_to_domain('dominant_understories', dominant_understory)

print('done')
