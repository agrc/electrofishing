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
        raise ('domain not found')

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
