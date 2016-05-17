"""
GetSegmentFromStartDistDir GP Service for Wildlife Projects

Geoprocessing task for getting the stream segment as defined by a start point
and a distance up or down stream. Doesn't work if you go across reach codes.

GP Parameters:
*input
point(0): FeatureSet
distance(1): Number (meters)
direction(2): String (up | down)
*output
segmentWGS(3): FeatureClass
    projected to WGS84 for easy placement in leaflet
segmentUTM(4): FeatureClass
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
# END TEST SERVER CONFIGS 

# set up logging and email
logger = logging.Logger(addLogsToArcpyMessages=True)
emailer = email.Emailer('stdavis@utah.gov')

# get parameters
point = arcpy.GetParameterAsText(0)
distance = arcpy.GetParameterAsText(1)
direction = arcpy.GetParameterAsText(2)  # up or down
# point = r'C:\Projects\WildlifeScripts\ToolData\TestData.gdb\Start1'
# distance = 700
# direction = 'up'

# folders and data
wgs84 = arcpy.SpatialReference('WGS 1984')
utm = arcpy.SpatialReference('NAD 1983 UTM Zone 12N')
linesTemplate = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\ToolData\InputSchemas.gdb\lines'
in_memory = 'in_memory'

# temp data
tempDissolve = r'{0}\tempDissolve'.format(in_memory)
tempSplit = r'{0}\tempSplit'.format(in_memory)
outData = r'{0}\outData'.format(arcpy.env.scratchGDB)
outWGS = r'{0}\outWGS'.format(arcpy.env.scratchGDB)
streamsLyr = 'streamsLyr'

# tool parameters
snapRadius = '100 Meters'
splitSearchRadius = 10

# fields
fldReachCode = 'ReachCode'

### TODO: remove from production
from agrc import arcpy_helpers
logger.logMsg('deleting temp data')
arcpy_helpers.DeleteIfExists([tempDissolve, tempSplit, outData, outWGS, streamsLyr])
###

try:
    logger.logMsg('validating parameters')
    try:
        distance = int(distance)
    except:
        raise Exception('invalid value passed for distance parameter: {0}'.format(distance))
    if direction not in ['up', 'down']:
        raise Exception('invalid value passed for direction parameter: {0}'.format(direction))

    logger.logMsg('snapping start point')
    arcpy.Snap_edit(point, [[streams, 'EDGE', snapRadius]])
    
    logger.logMsg('creating streams layer')
    arcpy.MakeFeatureLayer_management(streams, streamsLyr)
    
    logger.logMsg('selecting by location')
    arcpy.SelectLayerByLocation_management(streamsLyr, 'INTERSECT', point)
    
    logger.logMsg('looping through segments to get reach codes')
    values = [row[0] for row in arcpy.da.SearchCursor(streamsLyr, [fldReachCode])]
    lenValues = len(values)
    if lenValues == 0:
        raise Exception('no stream segments selected by snapped point!')
    elif lenValues == 1:
        # should this change anything? only one stream segment selected
        logger.logMsg('only one stream segment selected')
    rcodes = set(values)
    numCodes = len(rcodes)
    if numCodes == 0:
        raise Exception('no reach codes found!')
    elif numCodes > 1:
        raise Exception('more than one reach code found!')

    logger.logMsg('selecting by reach codes')
    query = "\"{0}\" = '{1}'".format(fldReachCode, values[0])
    logger.logMsg(query)
    arcpy.SelectLayerByAttribute_management(streamsLyr, 'NEW_SELECTION', query)
    
    logger.logMsg('dissolving selected features')
    arcpy.Dissolve_management(streamsLyr, tempDissolve)
    
    logger.logMsg('splitting feature by point')
    arcpy.SplitLineAtPoint_management(tempDissolve, point, tempSplit, splitSearchRadius)

    logger.logMsg('getting coord')
    with arcpy.da.SearchCursor(point, ["SHAPE@", "OID@"]) as cur:
        coord = cur.next()[0]

    logger.logMsg('looping through segments')
    found = False
    with arcpy.da.SearchCursor(tempSplit, ["SHAPE@", "OID@"]) as cur:
        for row in cur:
            line = row[0]
            if direction == 'up':
                searchPoint = line.lastPoint
            else:
                searchPoint = line.firstPoint
            if (coord.distanceTo(searchPoint) < splitSearchRadius):
                baseSegment = line
                found = True
                break

    if not found:
        raise Exception('no segment found that matches the start point!')

    logger.logMsg('building line')
    if direction == 'up':
        baseVertices = reversed(baseSegment.getPart(0))
    else:
        baseVertices = baseSegment.getPart(0)
    lineDistance = 0
    lineVertices = arcpy.Array()
    lineVertices.add(coord.firstPoint)
    for p in baseVertices:
        endPoint = arcpy.PointGeometry(lineVertices.getObject(lineVertices.count - 1))
        lineDistance = lineDistance + endPoint.distanceTo(p)
        lineVertices.add(p)
        if lineDistance >= distance:
            break

    logger.logMsg('lineDistance: {0}'.format(lineDistance))

    logger.logMsg('creating new feature class')
    arcpy.CreateFeatureclass_management(arcpy.env.scratchGDB, 'outData', 'POLYLINE', linesTemplate, "", "", utm)

    with arcpy.da.InsertCursor(outData, ["SHAPE@"]) as c:
        c.insertRow([arcpy.Polyline(arcpy.Array(lineVertices))])

    logger.logMsg('projecting to WGS84')
    arcpy.env.outputCoordinateSystem = wgs84
    arcpy.CopyFeatures_management(outData, outWGS)
    arcpy.SetParameter(4, outData)
    arcpy.SetParameter(3, outWGS)

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