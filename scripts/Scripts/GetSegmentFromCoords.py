"""
GetSegmentFromCoords GP Service for Wildlife Projects

Snaps the input points to the nearest stream and returns the segment
between them.
If it has trouble finding the path between the points it simply returns
a straight line between the points. It's better than nothing! Stop
complaining!

GP Parameters:
*input
points(0): FeatureSet
*output
segmentWGS(1): FeatureClass
    projected to WGS84 for easy placement in leaflet
segmentUTM(2): FeatureClass
    segment in utm for later submission to the addFeatures service

Scott Davis (stdavis@utah.gov)
Oct 2012
"""

import arcpy
from agrc import logging, email

# BEGIN LOCAL CONFIGS
# streams = r'C:\MapData\SGID10.gdb\StreamsNHDHighRes'
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
# streams = r'\\grhnas01sp.state.ut.us\AGSStores\data\SGID10.gdb\StreamsNHDHighRes'
# END TEST SERVER CONFIGS 

# BEGIN PROD SERVER CONFIGS
streams = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde\UDWRAquatics.AQUATICSADMIN.StreamsNHDHighRes'
# END PROD SERVER CONFIGS 

# set up logging and email
logger = logging.Logger(addLogsToArcpyMessages=True)
emailer = email.Emailer('stdavis@utah.gov')

# get parameters
points = arcpy.GetParameterAsText(0)
# points = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\ToolData\TestData.gdb\StartEnd4'

# folders and data
streamsLyr = 'streamsLyr'
tempLyr = 'tempLyr'
wgs84 = arcpy.SpatialReference('WGS 1984')
utm = arcpy.SpatialReference('NAD 1983 UTM Zone 12N')
linesTemplate = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\ToolData\InputSchemas.gdb\lines'
in_memory = 'in_memory'

# temp data
tempDissolve = r'{0}\tempDissolve'.format(in_memory)
tempSplit = r'{0}\tempSplit'.format(in_memory)
tempOutput = r'{0}\tempOutput'.format(arcpy.env.scratchGDB)
puntData = r'{0}\puntData'.format(arcpy.env.scratchGDB)

# tools parameters
searchRadius = '100 Meters'
splitSearchRadius = 10

# fields
fldReachCode = 'ReachCode'

### TODO: remove from production
from agrc import arcpy_helpers
logger.logMsg('deleting temp data')
arcpy_helpers.DeleteIfExists([tempDissolve, tempSplit, tempOutput, puntData])
###

try:
    logger.logMsg('snapping coords')
    arcpy.Snap_edit(points, [[streams, 'EDGE', searchRadius]])
    
    logger.logMsg('creating streams layer')
    arcpy.MakeFeatureLayer_management(streams, streamsLyr)
    
    logger.logMsg('selecting by location')
    arcpy.SelectLayerByLocation_management(streamsLyr, 'INTERSECT', points)
    
    logger.logMsg('looping through segments to get reach codes')
    values = [row[0] for row in arcpy.da.SearchCursor(streamsLyr, [fldReachCode])]
    lenValues = len(values)
    if lenValues == 0:
        raise Exception('no stream segments selected by snapped points!')
    elif lenValues == 1:
        # should this change anything? only one stream segment selected
        logger.logMsg('only one stream segment selected')
    rcodes = set(values)
    numCodes = len(rcodes)
    if numCodes == 0:
        raise Exception('no reach codes found!')
    elif numCodes > 1:
        logger.logMsg('more than one reach code found!')
    
    logger.logMsg('selecting by reach codes')
    query = "\"{0}\" IN ('{1}')".format(fldReachCode, "','".join(rcodes))
    logger.logMsg(query)
    arcpy.SelectLayerByAttribute_management(streamsLyr, 'NEW_SELECTION', query)
    
    logger.logMsg('dissolving selected features')
    arcpy.Dissolve_management(streamsLyr, tempDissolve)
    
    logger.logMsg('splitting feature by coords')
    arcpy.SplitLineAtPoint_management(tempDissolve, points, tempSplit, splitSearchRadius)
    
    logger.logMsg('getting coords')
    with arcpy.da.SearchCursor(points, ["SHAPE@", "OID@"]) as cur:
        coord1 = cur.next()[0]
        coord2 = cur.next()[0]
    
    logger.logMsg('looping through segments')
    found = False
    with arcpy.da.SearchCursor(tempSplit, ["SHAPE@", "OID@"]) as cur:
        for row in cur:
            line = row[0]
            if (coord1.distanceTo(line.firstPoint) < splitSearchRadius and coord2.distanceTo(line.lastPoint) < splitSearchRadius or
                coord2.distanceTo(line.firstPoint) < splitSearchRadius and coord1.distanceTo(line.lastPoint) < splitSearchRadius):
                oid = row[1]
                found = True
                break
            
    if found == False:
        logger.logMsg('no segment found that matches the input coords')
        # this is called punting :)
        
        logger.logMsg('creating new feature class')
        arcpy.CreateFeatureclass_management(arcpy.env.scratchGDB, 'puntData', 'POLYLINE', linesTemplate, "", "", utm)
        
        with arcpy.da.InsertCursor(puntData, ["SHAPE@"]) as c:
            array = arcpy.Array([coord1.firstPoint, coord2.firstPoint])
            c.insertRow([arcpy.Polyline(arcpy.Array(array))])
    else:
        logger.logMsg('exporting output segment feature')
        arcpy.MakeFeatureLayer_management(tempSplit, tempLyr, '"OBJECTID" = {0}'.format(oid))
        arcpy.CopyFeatures_management(tempLyr, puntData)
    
    logger.logMsg('projecting to WGS84')
    arcpy.env.outputCoordinateSystem = wgs84
    arcpy.CopyFeatures_management(puntData, tempOutput)
    arcpy.SetParameter(1, tempOutput)
    arcpy.SetParameter(2, puntData)

    ## not sure if I need this. If memory becomes a problem on the server, then maybe I do?
    # logger.logMsg('deleting in_memory data')
    # arcpy.Delete_management(in_memory)
    
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
