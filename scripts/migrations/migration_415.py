#!/usr/bin/env python
# * coding: utf8 *
"""
migration_415.py

A module that adds a new field to the Habitat table for recording the stream discharge value

Ref: https://github.com/agrc/electrofishing/issues/415
"""

import arcpy

arcpy.env.workspace = r"..."


def add_field():
    field_name = "DISCHARGE"
    table_name = "Habitat"
    describe = arcpy.da.Describe(table_name)
    if field_name not in [field.name for field in describe["fields"]]:
        print(f"adding {field_name} field")
        arcpy.management.AddField(
            table_name,
            field_name=field_name,
            field_type="FLOAT",
            field_alias="Discharge (CFS)",
        )
    else:
        print(f"{field_name} field already exists")


add_field()
