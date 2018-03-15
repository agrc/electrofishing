#!/usr/bin/env python
# * coding: utf8 *
'''
migration_78.py
A module that flips the domains for over and under story
'''
from os.path import dirname, join

import arcpy
import domains

arcpy.env.workspace = sde = join(dirname(__file__), 'local@electrofishing.sde')
dominant_overstory = [('as', 'Alkali sacaton'), ('ap', 'Anderson peachbush'), ('ae', 'Autum eleagus'), ('bbs', 'Basin big sagebrush'), ('bc', 'Bessy cherry'),
                      ('bl', 'Bladdersenia'), ('br', 'Bulrush'), ('bcf', 'Bush cinquefoil'), ('car', 'Carex'), ('cs', 'Cattle saltbrush'),
                      ('cmf', 'Creeping meadow foxtail'), ('cp', 'Desert peachbush'), ('dog', 'Dogwood'), ('dh', 'Douglas hawthorn'),
                      ('fs', 'Fourwing saltbrush'), ('gbw', 'Great Basin wildrye'), ('iw', 'Intermediate wheatgrass'), ('kb', 'Kentucky bluegrass'),
                      ('la', 'Leadplant amorpha'), ('ls', 'Longflower snowberry'), ('mw', 'Mammoth wildrye'), ('mbs', 'Mountain big sagebrush'),
                      ('mr', 'Mountain rye'), ('ms', 'Mountain snowberry'), ('ow', 'Oldman wormwood'), ('pc', 'Pecking catoneaster'), ('pp', 'Pygmy peashrub'),
                      ('rcg', 'Reed canary grass'), ('rh', 'River hawthorn'), ('rms', 'Rocky Mountain sumac'), ('rr', 'Rubber rabbitbrush'), ('rush', 'Rush'),
                      ('ss', 'Sand sagebrush'), ('sb', 'Sandberg bluegrass'), ('sbuf', 'Silver buffaloberry'), ('ssage', 'Silver sagebrush'), ('s',
                                                                                                                                               'Spikerush'),
                      ('to', 'Tall oatgrass'), ('tw', 'Tall wheatgrass'), ('th', 'Tetarian honeysuckle'), ('ts', 'Torrey saltbrush'), ('uh',
                                                                                                                                       'Utah honeysuckle'),
                      ('ws', 'Westerm snowberry'), ('wvb', 'Western virgin bower'), ('ww', 'Western wheatgrass'), ('wbs', 'Wyoming big sagebrush')]

dominant_understory = [('ap', 'American plum'), ('bs', 'Big saltbrush'), ('btm', 'Big tooth maple'), ('be', 'Blueberry elder'), ('cg', 'Canyon grape'),
                       ('cp', 'Carolina poplar'), ('cc', 'Chokecherry'), ('dw', 'Desert willow'), ('eb', 'Emory bacharis'), ('fc', 'Fremont cottonwood'),
                       ('go', 'Gamble oak'), ('gc', 'Golden currant'), ('gr', 'Greasewood'), ('hack', 'Hackberry'), ('hc', 'Hopa crabapple'), ('lil', 'Lilac'),
                       ('ma', 'Mountain ash'), ('nc', 'Narrowleaf cottonwood'), ('nml', 'New Mexico locust'), ('rt', 'Redtop'), ('rmm', 'Rocky Mountain maple'),
                       ('rm', 'Russian mulberry'), ('ss', 'Saskatoon serviceberry'), ('slo', 'Shrub live oak'), ('sp', 'Siberian peashrub'),
                       ('sbs', 'Skunk bush sumac'), ('wb', 'Water birch'), ('wil', 'Willow'), ('wr', 'Woods rose')]

print('getting domains')
domain_list = arcpy.da.ListDomains(sde)

print('getting dominant domains')
dominant_overstories = domains.get_domain_by_name('dominant_overstories', domain_list)
dominant_understories = domains.get_domain_by_name('dominant_understories', domain_list)

print('preparing delete')
overstory_codes = domains.get_codes_formatted_for_delete(dominant_overstories.codedValues)
understory_codes = domains.get_codes_formatted_for_delete(dominant_understories.codedValues)

print('deleting domains')
domains.delete_domains('dominant_overstories', overstory_codes, sde)
domains.delete_domains('dominant_understories', understory_codes, sde)

print('populating domains')
domains.add_values_to_domain('dominant_overstories', dominant_overstory, sde)
domains.add_values_to_domain('dominant_understories', dominant_understory, sde)

arcpy.RefreshCatalog(sde)
print('done')
