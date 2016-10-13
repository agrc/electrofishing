import arcpy


counties = r'Database Connections\SGID10.sde\SGID10.BOUNDARIES.Counties'
arcpy.env.workspace = r'C:\MapData\dwrlakesstreams.gdb'

for fc in ['Lakes', 'Streams']:
    print(fc)

    print('spatial join')
    spatial_join = arcpy.SpatialJoin_analysis(fc, counties, r'in_memory\{}'.format(fc))

    print('adding field')
    arcpy.AddField_management(fc, 'COUNTY', 'TEXT', None, None, 15)

    print('making layer')
    layer = arcpy.MakeFeatureLayer_management(fc)

    print('adding join')
    joined = arcpy.AddJoin_management(layer, 'OBJECTID', spatial_join, 'TARGET_FID')

    print('calculating field')
    arcpy.CalculateField_management(joined, 'COUNTY', '!NAME!', 'PYTHON')
