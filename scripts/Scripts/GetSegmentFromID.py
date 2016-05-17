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

Scott Davis (stdavis@utah.gov)
Oct 2012
"""

import arcpy
from agrc import logging, email

# BEGIN LOCAL CONFIGS
# nhdStreams = r'C:\MapData\SGID10.gdb\StreamsNHDHighRes'
# waterbodyIDs = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\Wildlife_LOCAL.sde\Wildlife.DBO.WaterbodyIds_Streams'
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
# nhdStreams = r'\\grhnas01sp.state.ut.us\AGSStores\data\SGID10.gdb\StreamsNHDHighRes'
# waterbodyIDs = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\Wildlife_TEST as WildAdmin2.sde\Wildlife.WILDADMIN.WaterbodyIds_Streams'
# END TEST SERVER CONFIGS 

# BEGIN PROD SERVER CONFIGS
nhdStreams = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde\UDWRAquatics.AQUATICSADMIN.StreamsNHDHighRes'
waterbodyIDs = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit2.sde\UDWRAquatics.AQUATICSADMIN.WaterbodyIds_Streams'
# END TEST SERVER CONFIGS 

# set up logging and email
logger = logging.Logger(addLogsToArcpyMessages=True)
emailer = email.Emailer('stdavis@utah.gov')

# get parameters
id = arcpy.GetParameterAsText(0)
type = arcpy.GetParameterAsText(1)  # waterbodyid or reachcode

# folders and data
layer = 'layer'
wgs84 = arcpy.SpatialReference('WGS 1984')

# temp data
tempDissolve = r'{0}\tempDissolve'.format(arcpy.env.scratchGDB)
tempWGS = r'{0}\tempWGS'.format(arcpy.env.scratchGDB)

# fields
fldReachCode = 'ReachCode'
fldID = 'WaterID'

### TODO: remove from production
from agrc import arcpy_helpers
logger.logMsg('deleting temp data')
arcpy_helpers.DeleteIfExists([tempDissolve, tempWGS])
###

try:
    # choose the correct dataset
    logger.logMsg('creating layer')
    if type == 'reachcode':
        arcpy.MakeFeatureLayer_management(nhdStreams, layer, "\"{0}\" = '{1}'".format(fldReachCode, id))
        dissolve_field = fldReachCode
    elif type == 'waterbodyid':
        arcpy.MakeFeatureLayer_management(waterbodyIDs, layer, "\"{0}\" = '{1}'".format(fldID, id))
        dissolve_field = fldID
    else:
        raise Exception("type: {0} is unknown. Should be 'reachcode' or 'waterbodyid'.".format(type))

    logger.logMsg('counting selected features')
    count = int(arcpy.GetCount_management(layer).getOutput(0))
    if not count > 0:
        raise Exception('No matching id found!')
    
    logger.logMsg('dissolving')
    arcpy.Dissolve_management(layer, tempDissolve, dissolve_field)
    arcpy.SetParameter(3, tempDissolve)

    logger.logMsg('projecting data to wgs')
    arcpy.env.outputCoordinateSystem = wgs84
    arcpy.CopyFeatures_management(tempDissolve, tempWGS)
    arcpy.SetParameter(2, tempWGS)

    logger.logMsg('script executed successfully')

except arcpy.ExecuteError as e:
    logger.logMsg('arcpy.ExecuteError')
    logger.logError()
    logger.logGPMsg()
    emailer.sendEmail(logger.scriptName + ' - arcpy.ExecuteError', logger.log)
    raise e
except Exception as e:
    logger.logError()
    emailer.sendEmail(logger.scriptName + ' - Python Error', logger.log)
    raise e
finally:
    logger.writeLogToFile()