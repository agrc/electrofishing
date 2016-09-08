"""
New Collection Event Service for Wildlife Project

Accepts a JSON object with all collection event event data. See scripts/Scripts/TestData/NewCollectionEventData.json for an example.

I tried doing this with feature/record sets as inputs and using the Append tool to add the data.
However, it would return successful but not add the data as expected. Thus the InsertCursor solution.

GP Parameters:
*input
data(0): JSON String

"""
import arcpy
import settings
import json
from datetime import datetime


def appendTableData(tableName, rows):
    arcpy.AddMessage('Adding row(s) to {}'.format(tableName))
    cursor = arcpy.da.InsertCursor(tableName, rows[0].keys())
    for row in rows:
        cursor.insertRow([row[key] for key in row.keys()])

    del cursor


def appendFeatureData(feature):
    arcpy.AddMessage('Adding feature to SamplingEvents')
    attributes = feature['attributes']
    attributes[settings.EVENT_DATE] = datetime.strptime(attributes[settings.EVENT_DATE], '%Y-%m-%d')
    fields = attributes.keys() + ['SHAPE@JSON']
    cursor = arcpy.da.InsertCursor(settings.SAMPLINGEVENTS, fields)
    cursor.insertRow([attributes[key] for key in attributes.keys()] + [json.dumps(feature['geometry'])])

    del cursor

data = json.loads(arcpy.GetParameterAsText(0))


arcpy.env.workspace = settings.DB
with arcpy.da.Editor(settings.DB) as edit:
    for table in data.keys():
        if table == settings.SAMPLINGEVENTS:
            appendFeatureData(data[table])
        elif len(data[table]) > 0:
            appendTableData(table, data[table])
