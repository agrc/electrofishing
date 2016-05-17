import arcpy

toolbox = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Toolbox.tbx'
db = arcpy.env.scratchGDB
base = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\TestData.gdb'

arcpy.ImportToolbox(toolbox)

tests = [
         ['16020308001003', 'reachcode'],
         ['16020308000211', 'reachcode']
         ]

arcpy.AddMessage('deleting previous data')
arcpy.env.workspace = db
fcs = arcpy.ListFeatureClasses('Lines*')
if fcs != None:
    for f in fcs:
        arcpy.Delete_management(f)
        
for t in tests:
    arcpy.AddMessage(str(t))
    output = arcpy.GetSegmentFromID(t[0], t[1])
    
    arcpy.CopyFeatures_management(output, 'Lines' + t[0])

arcpy.AddMessage('done')