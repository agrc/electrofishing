'''
ExportBulkDataUploadSpreadsheet.py

A module that exports the current electrofishing database schema as an Excel spreadsheet for bulk data upload
'''

from os.path import dirname, join

import arcpy
import xlsxwriter

arcpy.env.workspace = sde = join(dirname(__file__), 'migrations', 'local@electrofishing.sde')


workbook = xlsxwriter.Workbook('ElectrofishingBulkUpload.xlsx')

skip_fields = ['OBJECTID', 'EVENT_ID', 'STATION_ID', 'SHAPE', 'SHAPE.STLength()', 'GEO_DEF']

domain_ranges = {}
domains_sheet_name = 'domains'
domains_sheet = workbook.add_worksheet(domains_sheet_name)
column = 0
bold_format = workbook.add_format({'bold': True})
print('exporting domains')
for domain in arcpy.da.ListDomains(sde):
    if domain.codedValues:
        domains_sheet.write(0, column, domain.name, bold_format)

        row = 1
        max_length = len(domain.name)
        for value in domain.codedValues.values():
            domains_sheet.write(row, column, value)
            length = len(value)
            if length > max_length:
                max_length = length
            row = row + 1

        domains_sheet.set_column(column, column, max_length + 1)
        domain_ranges[domain.name] = (xlsxwriter.utility.xl_range_abs(1, column, row - 1, column), max_length)

        column = column + 1

for table in [table.split('.')[-1] for table in arcpy.ListFeatureClasses() + arcpy.ListTables()]:
    print('exporting {}'.format(table))
    sheet = workbook.add_worksheet(table)

    column = 0
    for field in arcpy.ListFields(table):
        if field.name in skip_fields:
            continue

        #: write header
        sheet.write(0, column, field.name, bold_format)

        if field.domain and field.type == 'String':
            range, length = domain_ranges[field.domain]
            #: set up picklist
            sheet.data_validation(1, column, 9, column, {
                'validate': 'list',
                'source': '={}!{}'.format(domains_sheet_name, range)
            })
            sheet.set_column(column, column, max_length + 1)
        else:
            sheet.set_column(column, column, len(field.name) + 1)

        column = column + 1


workbook.close()
