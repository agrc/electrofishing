import arcpy
from os import path

arcpy.env.workspace = path.join(path.dirname(__file__), 'settings', 'Electrofishing_LOCAL as WILDADMIN.sde')

fcs = arcpy.ListFeatureClasses()
for f in fcs:
    if f.split('.')[-1].upper() not in ['WATERBODYIDS_STREAMS', 'STREAMSNHDHIGHRES', 'SDE_COMPRESS_LOG', 'STATIONS']:
        print('deleting features from {}'.format(f))
        arcpy.DeleteFeatures_management(f)

tbls = arcpy.ListTables()
for t in tbls:
    if t.split('.')[-1].upper() not in ['SDE_COMPRESS_LOG']:
        print('deleting rows from {}'.format(t))
        arcpy.DeleteRows_management(t)

print('done')
