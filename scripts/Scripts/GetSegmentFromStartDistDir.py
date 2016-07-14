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
"""
import arcpy
from os import path
from settings import *


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
linesTemplate = path.join(path.dirname(__file__), '..', 'ToolData', 'InputSchemas.gdb', 'lines')
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

if arcpy.Exists(tempDissolve):
    arcpy.Delete_management(tempDissolve)
if arcpy.Exists(tempSplit):
    arcpy.Delete_management(tempSplit)

try:
    distance = int(distance)
except:
    raise Exception('invalid value passed for distance parameter: {0}'.format(distance))
if direction not in ['up', 'down']:
    raise Exception('invalid value passed for direction parameter: {0}'.format(direction))

arcpy.Snap_edit(point, [[STREAMS, 'EDGE', snapRadius]])

arcpy.MakeFeatureLayer_management(STREAMS, streamsLyr)

arcpy.SelectLayerByLocation_management(streamsLyr, 'INTERSECT', point)

values = [row[0] for row in arcpy.da.SearchCursor(streamsLyr, [fldReachCode])]
lenValues = len(values)
if lenValues == 0:
    raise Exception('no stream segments selected by snapped point!')
rcodes = set(values)
numCodes = len(rcodes)
if numCodes == 0:
    raise Exception('no reach codes found!')
elif numCodes > 1:
    raise Exception('more than one reach code found!')

query = "\"{0}\" = '{1}'".format(fldReachCode, values[0])
arcpy.SelectLayerByAttribute_management(streamsLyr, 'NEW_SELECTION', query)

arcpy.Dissolve_management(streamsLyr, tempDissolve)

arcpy.SplitLineAtPoint_management(tempDissolve, point, tempSplit, splitSearchRadius)

with arcpy.da.SearchCursor(point, ["SHAPE@", "OID@"]) as cur:
    coord = cur.next()[0]

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

arcpy.CreateFeatureclass_management(arcpy.env.scratchGDB, 'outData', 'POLYLINE', linesTemplate, "", "", utm)

with arcpy.da.InsertCursor(outData, ["SHAPE@"]) as c:
    c.insertRow([arcpy.Polyline(arcpy.Array(lineVertices))])

arcpy.env.outputCoordinateSystem = wgs84
arcpy.CopyFeatures_management(outData, outWGS)
arcpy.SetParameter(4, outData)
arcpy.SetParameter(3, outWGS)
