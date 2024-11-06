#!/usr/bin/env python
# * coding: utf8 *
"""
migration_239.py

A module that adds a field for recording the submitter's email address in addition to fixing some values so that they match their associated domain values.

Ref: https://github.com/agrc/electrofishing/issues/239
"""

import arcpy

arcpy.env.workspace = r"..."


def add_field():
    field_name = "SUBMITTER"
    table_name = "SamplingEvents"
    describe = arcpy.da.Describe(table_name)
    if field_name not in [field.name for field in describe["fields"]]:
        print(f"adding {field_name} field")
        arcpy.management.AddField(
            table_name,
            field_name=field_name,
            field_type="TEXT",
            field_length=255,
            field_alias="Submitter Email",
        )
    else:
        print(f"{field_name} field already exists")


def fix_values():
    mappings = [
        ("backpack", "Backpack"),
        ("canoebarge", "Canoe/Barge"),
        ("raftboat", "Raft/Boat"),
    ]
    field_name = "TYPE"
    print("fixing equipment type values...")
    layer = arcpy.management.MakeFeatureLayer("Equipment", "equipment_layer")

    for old_value, new_value in mappings:
        print(f"fixing {old_value} to {new_value}")
        arcpy.management.SelectLayerByAttribute(
            layer, "NEW_SELECTION", f"{field_name} = '{old_value}'"
        )
        count = arcpy.management.GetCount(layer)[0]
        print(f"count: {count}")
        arcpy.management.CalculateField(layer, field_name, f"'{new_value}'", "PYTHON3")
        arcpy.management.SelectLayerByAttribute(layer, "CLEAR_SELECTION")


add_field()
fix_values()
