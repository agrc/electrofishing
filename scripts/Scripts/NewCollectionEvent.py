"""
New Collection Event Service for Wildlife Project

Accepts a JSON object with all collection event event data. See scripts/Scripts/TestData/NewCollectionEventData.json for an example.

I tried doing this with feature/record sets as inputs and using the Append tool to add the data.
However, it would return successful but not add the data as expected. Thus the InsertCursor solution.

GP Parameters:
*input
data(0): JSON String

"""
import json
from datetime import datetime

import arcpy
import settings


def appendTableData(tableName, rows):
    arcpy.AddMessage('Adding row(s) to {}'.format(tableName))

    with arcpy.da.InsertCursor(tableName, rows[0].keys()) as cursor:
        for row in rows:
            cursor.insertRow([row[key] for key in row.keys()])


def appendFeatureData(feature):
    arcpy.AddMessage('Adding feature to SamplingEvents')
    attributes = feature['attributes']
    attributes[settings.EVENT_DATE] = datetime.strptime(attributes[settings.EVENT_DATE], '%Y-%m-%d')
    fields = attributes.keys() + ['SHAPE@JSON']

    with arcpy.da.InsertCursor(settings.SAMPLINGEVENTS, fields) as cursor:
        cursor.insertRow([attributes[key] for key in attributes.keys()] + [json.dumps(feature['geometry'])])


data = json.loads(arcpy.GetParameterAsText(0))
# data = json.loads(open('TestData/NewCollectionEventData.json').read())


arcpy.env.workspace = settings.DB

edit = arcpy.da.Editor(settings.DB)
edit.startEditing(False, True)
edit.startOperation()

try:
    for table in data.keys():
        if table == settings.SAMPLINGEVENTS:
            appendFeatureData(data[table])
        elif len(data[table]) > 0:
            appendTableData(table, data[table])
except Exception as e:
    edit.abortOperation()
    edit.stopEditing(False)
    raise e

edit.stopOperation()
edit.stopEditing(True)

# arcpy.Compress_management(settings.DB)
