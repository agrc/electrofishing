#!/usr/bin/env python
# * coding: utf8 *
'''
Domains.py
A module that helps with domain stuff
'''

import arcpy


def get_domain_by_name(name, domains):
    domain = [domain for domain in domains if domain.name == name]
    if len(domain) != 1:
        raise Exception('domain not found')

    return domain[0]


def get_codes_formatted_for_delete(coded_values):
    domain_string = []

    for code, value in coded_values.iteritems():
        domain_string.append("'{}: {}'".format(code, value))

    code = ';'.join(domain_string)

    return code


def delete_domains(name, codes, workspace):
    if codes == '':
        return

    arcpy.management.DeleteCodedValueFromDomain(in_workspace=workspace, domain_name=name, code=codes)


def add_values_to_domain(name, code_value_pairs, workspace):
    for code, value in code_value_pairs:
        arcpy.management.AddCodedValueToDomain(in_workspace=workspace, domain_name=name, code=code, code_description=value)


def add_if_not_exists(domain, workspace, code, value=None):
    if code in domain.codedValues:
        print('skipping add: {}'.format(code))

        return

    if value is None:
        value = code

    arcpy.management.AddCodedValueToDomain(in_workspace=workspace, domain_name=domain.name, code=code, code_description=value)


def delete_if_exists(domain, workspace, code):
    if code not in domain.codedValues:
        print('{} not found, skipping'.format(code))

        return

    value = domain.codedValues[code]
    codes = get_codes_formatted_for_delete({code: value})

    delete_domains(domain.name, codes, workspace)
