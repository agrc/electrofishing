import arcpy

toolbox = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Toolbox.tbx'
db = arcpy.env.scratchGDB
base = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\ToolData\TestData.gdb'

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
          'StartEnd9'
          ]

arcpy.AddMessage('deleting previous data')
arcpy.env.workspace = db
fcs = arcpy.ListFeatureClasses('tempLines*')
if fcs != None:
    for f in fcs:
        arcpy.Delete_management(f)

for l in layers:
    arcpy.AddMessage(base + '\\' + l)
    output = arcpy.GetSegmentFromCoords(base + '\\' + l)
    
    arcpy.AddMessage('output: ' + str(output))
    arcpy.CopyFeatures_management(output, l+'Lines')
    
arcpy.AddMessage('done')