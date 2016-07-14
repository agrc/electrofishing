"""
GetSegmentFromID GP Service for Wildlife Projects

Geoprocessing service that returns a stream segment as represented by
a waterbodyid or reach code

GP Parameters:
*input
id(0): String
type(1): String (reachcode or waterbodyid)
segmentWGS(2): FeatureClass
    projected to WGS84 for easy placement in leaflet
segmentUTM(3): FeatureClass
    segment in utm for later submission to the addFeatures service
"""

import arcpy
from settings import *

# get parameters
id = arcpy.GetParameterAsText(0)
type = arcpy.GetParameterAsText(1)  # waterbodyid or reachcode

# folders and data
layer = 'layer'
wgs84 = arcpy.SpatialReference('WGS 1984')

# temp data
tempDissolve = r'{0}\tempDissolve'.format(arcpy.env.scratchGDB)
tempWGS = r'{0}\tempWGS'.format(arcpy.env.scratchGDB)

if arcpy.Exists(tempDissolve):
    arcpy.Delete_management(tempDissolve)
if arcpy.Exists(tempWGS):
    arcpy.Delete_management(tempWGS)

# fields
fldReachCode = 'ReachCode'
fldID = 'WaterID'

# choose the correct dataset
if type == 'reachcode':
    arcpy.MakeFeatureLayer_management(STREAMS, layer, "\"{0}\" = '{1}'".format(fldReachCode, id))
    dissolve_field = fldReachCode
elif type == 'waterbodyid':
    arcpy.MakeFeatureLayer_management(waterbodyIDs, layer, "\"{0}\" = '{1}'".format(fldID, id))
    dissolve_field = fldID
else:
    raise Exception("type: {0} is unknown. Should be 'reachcode' or 'waterbodyid'.".format(type))

count = int(arcpy.GetCount_management(layer).getOutput(0))
if not count > 0:
    raise Exception('No matching id found!')

arcpy.Dissolve_management(layer, tempDissolve, dissolve_field)
arcpy.SetParameter(3, tempDissolve)

arcpy.env.outputCoordinateSystem = wgs84
arcpy.CopyFeatures_management(tempDissolve, tempWGS)
arcpy.SetParameter(2, tempWGS)
