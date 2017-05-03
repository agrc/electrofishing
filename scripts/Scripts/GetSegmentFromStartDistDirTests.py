"""Tests for Electrofishing geoprocessing tools."""
import arcpy
from os.path import join

toolbox = r'..\Toolbox.tbx'
base = r'..\ToolData\TestData.gdb'
db = arcpy.env.scratchGDB

arcpy.ImportToolbox(toolbox)

tests = [
          ['Start1', 1500, 'up'],
          ['Start2', 300, 'down'],
          ['Start_fork', 2500, 'down']
          ]

arcpy.AddMessage('deleting previous data')
arcpy.env.workspace = db
arcpy.env.overwriteOutput = True
fcs = arcpy.ListFeatureClasses('*Lines')
if fcs is not None:
    for f in fcs:
        arcpy.Delete_management(f)

for l in tests:
    layer_name, distance, direction = l
    output = arcpy.GetSegmentFromStartDistDir(base + '\\' + layer_name, distance, direction)

    utm_result = arcpy.CopyFeatures_management(output[1], arcpy.Geometry())[0]
    utm_expected = arcpy.CopyFeatures_management(join(base, layer_name + '_result_utm'), arcpy.Geometry())[0]
    if utm_result.equals(utm_expected):
        arcpy.AddMessage(layer_name + ' PASSED')
    else:
        arcpy.AddMessage(layer_name + ' FAILED')

arcpy.AddMessage('done')
