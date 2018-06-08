"""
New Collection Event Service for Wildlife Project

Accepts a JSON object with all collection event event data. See scripts/Scripts/TestData/NewCollectionEventData.json for an example.

I tried doing this with feature/record sets as inputs and using the Append tool to add the data.
However, it would return successful but not add the data as expected. Thus the InsertCursor solution.

GP Parameters:
*input
data(0): JSON String

"""
import datetime
import json

import arcpy
import settings


def appendTableData(tableName, rows):
    arcpy.AddMessage('Adding row(s) to {}'.format(tableName))

    fields = list(rows[0].keys())
    field_set = set(fields)
    with arcpy.da.InsertCursor(tableName, fields) as cursor:
        for row in rows:
            row_fields = list(row.keys())

            uhoh = field_set ^ set(row_fields)

            if len(uhoh) != 0:
                message = 'fields do not match: {}'.format(','.join(uhoh))
                arcpy.AddWarning(message)

                raise Exception(message)

            cursor.insertRow([row[key] for key in row_fields])


def appendFeatureData(feature):
    arcpy.AddMessage('Adding feature to SamplingEvents {}'.format(feature))

    attributes = feature['attributes']
    time = None

    if ':' in attributes['EVENT_TIME']:
        time = datetime.datetime.strptime(attributes['EVENT_TIME'], '%H:%M').time()

    date = datetime.datetime.strptime(attributes[settings.EVENT_DATE], '%Y-%m-%d')

    if time is not None:
        attributes[settings.EVENT_DATE] = datetime.datetime.combine(date, time)
    else:
        attributes[settings.EVENT_DATE] = date

    fields = list(attributes.keys()) + ['SHAPE@JSON']
    fields.remove('EVENT_TIME')
    attributes.pop('EVENT_TIME')

    with arcpy.da.InsertCursor(settings.SAMPLINGEVENTS, fields) as cursor:
        cursor.insertRow([attributes[key] for key in list(attributes.keys())] + [json.dumps(feature['geometry'])])


data = json.loads(arcpy.GetParameterAsText(0))
# data = json.loads(open('TestData/NewCollectionEventData.json').read())
# data = json.loads(open('TestData/NewCollectionEventData2.json').read())
# data = json.loads(open('TestData/NewCollectionEventData3.json').read())
arcpy.AddMessage('Received Data: {}'.format(data))

arcpy.env.workspace = settings.DB

edit = arcpy.da.Editor(settings.DB)
edit.startEditing(False, True)
edit.startOperation()

try:
    versioned = arcpy.Describe(list(data.keys())[0]).isVersioned
    if not versioned:
        arcpy.AddError('Data is versioned: {}'.format(versioned))

    for table in list(data.keys()):
        if table == settings.SAMPLINGEVENTS:
            appendFeatureData(data[table])
        elif len(data[table]) > 0:
            appendTableData(table, data[table])
except Exception as e:
    arcpy.AddError(e)
    edit.abortOperation()
    edit.stopEditing(False)
    raise e

edit.stopOperation()
edit.stopEditing(True)

# arcpy.Compress_management(settings.DB)
