"""Tests for Electrofishing geoprocessing tools."""
import arcpy
from os.path import join

toolbox = r'..\Toolbox.tbx'
db = arcpy.env.scratchGDB
base = r'..\ToolData\TestData.gdb'

arcpy.ImportToolbox(toolbox)

layers = [
          'StartEnd1',
          'StartEnd2',
          'StartEnd3',
          'StartEnd4',
          'StartEnd5',
          'StartEnd6',
          'StartEnd7',
          'StartEnd8',
          'StartEnd9',
          'StartEnd_fork',
          'StartEnd_straight'
          ]

arcpy.AddMessage('deleting previous data')
arcpy.env.workspace = db
arcpy.env.overwriteOutput = True
fcs = arcpy.ListFeatureClasses('tempOutput*')
fcs.extend(arcpy.ListFeatureClasses('puntData*'))
if fcs is not None:
    for f in fcs:
        arcpy.Delete_management(f)

for l in layers:
    arcpy.AddMessage(base + '\\' + l)
    output = arcpy.GetSegmentFromCoords(base + '\\' + l)
    utm_result = arcpy.CopyFeatures_management(output[1], arcpy.Geometry())[0]
    utm_expected = arcpy.CopyFeatures_management(join(base, l + '_result_utm'), arcpy.Geometry())[0]
    if utm_result.equals(utm_expected):
        arcpy.AddMessage(l + ' PASSED')
    else:
        arcpy.AddMessage(l + ' FAILED')

arcpy.AddMessage('done')
