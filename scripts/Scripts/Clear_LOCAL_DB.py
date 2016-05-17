import arcpy

arcpy.env.workspace = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde'

fcs = arcpy.ListFeatureClasses()
for f in fcs:
    if not f in ['UDWRAquatics.AQUATICSADMIN.WaterbodyIds_Streams', 'UDWRAquatics.AQUATICSADMIN.StreamsNHDHighRes']:
        print 'deleting features from {}'.format(f)
        arcpy.DeleteFeatures_management(f)

tbls = arcpy.ListTables()
for t in tbls:
    print 'deleting rows from {}'.format(t)
    arcpy.DeleteRows_management(t)
    
print 'done'