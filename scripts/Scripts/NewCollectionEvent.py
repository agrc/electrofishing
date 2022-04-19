"""
New Collection Event Service for Wildlife Project

Accepts a JSON object with all collection event event data. See scripts/Scripts/TestData/NewCollectionEventData.json for an example.

We are using pyodbc and insert statements against versioned views because this handles mutiple edit sessions
much better than insert cursors.

GP Parameters:
*input
data(0): JSON String

"""
import datetime
import json

import arcpy
import settings
import pyodbc


def clean_up_time(attributes):
    time = None
    if attributes['EVENT_TIME'] is not None and ':' in attributes['EVENT_TIME']:
        time = datetime.datetime.strptime(attributes['EVENT_TIME'],
                                          '%H:%M').time()

    date = datetime.datetime.strptime(attributes[settings.EVENT_DATE],
                                      '%Y-%m-%d')

    if time is not None:
        attributes[settings.EVENT_DATE] = datetime.datetime.combine(date, time)
    else:
        attributes[settings.EVENT_DATE] = date

    attributes.pop('EVENT_TIME')

    return attributes


data = json.loads(arcpy.GetParameterAsText(0))
# data = json.loads(open('TestData/NewCollectionEventData.json').read())
# data = json.loads(open('TestData/NewCollectionEventData2.json').read())
# data = json.loads(open('TestData/NewCollectionEventData3.json').read())
arcpy.AddMessage('Received Data: {}'.format(data))

#: log reports to file system - this could be disabled at some point
outpath = r'C:\temp\reports\\' + datetime.datetime.now().isoformat().replace(
    ':', '-') + '.json'
with open(outpath, 'w') as outfile:
    json.dump(data, outfile, indent=2)


def format_value(value):
    if value is None:
        return 'NULL'
    elif isinstance(value, str):
        return '\'' + value + '\''
    elif isinstance(value, datetime.datetime):
        return '\'' + str(value) + '\''

    return str(value)


def format_geometry(json):
    coords = [str(pair[0]) + ' ' + str(pair[1]) for pair in json['paths'][0]]

    return 'geometry::STGeomFromText(\'LINESTRING ({})\', {})'.format(
        ', '.join(coords), json['spatialReference']['wkid'])


connection_string = 'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={};DATABASE={};UID={};PWD={}'.format(
    settings.INSTANCE, settings.DATABASE_NAME, settings.USERNAME,
    settings.PASSWORD)
connection = pyodbc.connect(connection_string)
cursor = connection.cursor()


def make_insert(table, attributes, shape=None):
    fields = list(attributes.keys())
    values = [format_value(value) for value in attributes.values()]

    if shape is not None:
        fields.append('SHAPE')
        values.append(shape)

    statement = 'INSERT INTO [WILDADMIN].[{}_evw] ({}) VALUES ({})'.format(
        table, ', '.join(fields), ', '.join(values))
    arcpy.AddMessage(statement)
    cursor.execute(statement)


for table in data:
    if table == settings.SAMPLINGEVENTS:
        attributes = clean_up_time(data[table]['attributes'])
        shape = format_geometry(data[table]['geometry'])
        make_insert(table, attributes, shape)
    else:
        for attributes in data[table]:
            make_insert(table, attributes)

cursor.commit()
