import arcpy

toolbox = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Toolbox.tbx'
base = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\TestData.gdb'
db = arcpy.env.scratchGDB

arcpy.ImportToolbox(toolbox)

tests = [
          ['Start1', 1500, 'up'],
          ['Start2', 300, 'down']
          ]

arcpy.AddMessage('deleting previous data')
arcpy.env.workspace = db
fcs = arcpy.ListFeatureClasses('*Lines')
if fcs != None:
    for f in fcs:
        arcpy.Delete_management(f)
        
for l in tests:
    arcpy.AddMessage(l)
    output = arcpy.GetSegmentFromStartDistDir(base + '\\' + l[0], l[1], l[2])
    
    arcpy.CopyFeatures_management(output, l + 'Lines')

arcpy.AddMessage('done')