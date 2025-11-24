"""
New Collection Event Service for Wildlife Project

Accepts a JSON object with all collection event event data. See scripts/Scripts/TestData/NewCollectionEventData.json for an example.

We are using pyodbc and insert statements against versioned views because this handles multiple edit sessions
much better than insert cursors.

GP Parameters:
*input
data(0): JSON String

"""

import datetime
import json

import arcpy
import pyodbc
import settings


def clean_up_time(values):
    """
    Clean up the time field and combine it with the date field

    :param values: dictionary of values

    :return: dictionary of values with the date and time combined
    """
    time = None
    if values["EVENT_TIME"] is not None and ":" in values["EVENT_TIME"]:
        time = datetime.datetime.strptime(values["EVENT_TIME"], "%H:%M").time()

    date = datetime.datetime.strptime(values[settings.EVENT_DATE], "%Y-%m-%d")

    if time is not None:
        values[settings.EVENT_DATE] = datetime.datetime.combine(date, time)
    else:
        values[settings.EVENT_DATE] = date

    values.pop("EVENT_TIME")

    return values


data = json.loads(arcpy.GetParameterAsText(0))
# data = json.loads(open('TestData/SyntaxError.json').read())
# data = json.loads(open('TestData/NewCollectionEventData2.json').read())
# data = json.loads(open('TestData/NewCollectionEventData3.json').read())
# arcpy.AddMessage('Received Data: {}'.format(data))

#: log reports to file system - this could be disabled at some point
outpath = (
    rf'D:\temp\reports\{datetime.datetime.now().isoformat().replace(":", "-")}.json'
)
with open(outpath, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, indent=2)


def format_geometry(geometry):
    """
    Format the geometry for insertion into the database

    :param json: dictionary of geometry data

    :return: string of the geometry
    """
    coords = [str(pair[0]) + " " + str(pair[1]) for pair in geometry["paths"][0]]

    return f"""LINESTRING ({", ".join(coords)})"""


CONNECTION_STRING = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={settings.INSTANCE}"
    f";DATABASE={settings.DATABASE_NAME};UID={settings.USERNAME};PWD={settings.PASSWORD}"
)
connection = pyodbc.connect(CONNECTION_STRING)
cursor = connection.cursor()


def make_insert(target_table, insert_values, geometry=None):
    """
    Make an insert statement taking into account optional geometry

    :param target_table: string of the table to insert into
    :param insert_values: dictionary of values to insert
    :param geometry: string of the geometry to insert
    """

    fields = list(insert_values.keys())
    values = [value for value in insert_values.values()]

    if geometry is not None:
        fields.append("SHAPE")
        additional_statement = ", geometry::STGeomFromText(?, 26912))"
        parameters = values + [geometry]
    else:
        additional_statement = ")"
        parameters = values
    base_statement = (
        f'INSERT INTO [{settings.USERNAME}].[{target_table}_evw] ({", ".join(fields)}) '
        f'VALUES ({", ".join(["?" for _ in values])}'
    )
    statement = f"{base_statement}{additional_statement}"
    cursor.execute(statement, *parameters)


for table in data:
    if table == settings.SAMPLINGEVENTS:
        attributes = clean_up_time(data[table]["attributes"])
        shape = format_geometry(data[table]["geometry"])
        make_insert(table, attributes, shape)
    else:
        for attributes in data[table]:
            make_insert(table, attributes)

connection.commit()
