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
    segment in utm for later submission to the NewCollectionEvent service
success(3): boolean
    true if a segment was successfully returned
error_message(4): string
    only populated if success is false
"""

import arcpy
from os import path
from settings import *
from dijkstras import shortest_path, LineNode
from time import clock

# get parameters
points = arcpy.GetParameterAsText(0)
# points = r'C:\giswork\electrofishing\TempData.gdb\StartEnd_Fork'

# folders and data
streamsLyr = 'streamsLyr'
tempLyr = 'tempLyr'
wgs84 = arcpy.SpatialReference('WGS 1984')
utm = arcpy.SpatialReference('NAD 1983 UTM Zone 12N')
linesTemplate = path.join(path.dirname(__file__), '..\ToolData\InputSchemas.gdb\lines')
in_memory = 'in_memory'

# temp data
tempDissolve = r'{0}\tempDissolve'.format(in_memory)
tempSplit = r'{0}\tempSplit'.format(in_memory)
tempOutput = r'{0}\tempOutput'.format(arcpy.env.scratchGDB)
puntData = r'{0}\puntData'.format(arcpy.env.scratchGDB)

# tools parameters
searchRadius = '100 Meters'
splitSearchRadius = 100

# fields
near_distance_field = 'NEAR_DIST'
nearFidField = 'NEAR_FID'


def makeLine(point1, point2, outputPath):
    arcpy.CreateFeatureclass_management(arcpy.env.scratchGDB, 'puntData', 'POLYLINE', linesTemplate, "", "", utm)

    with arcpy.da.InsertCursor(outputPath, ["SHAPE@"]) as c:
        array = arcpy.Array([point1.firstPoint, point2.firstPoint])
        c.insertRow([arcpy.Polyline(arcpy.Array(array))])
    return puntData


def getSegment():
    try:
        for ds in [tempDissolve, tempSplit, tempOutput, puntData]:
            if arcpy.Exists(ds):
                arcpy.Delete_management(ds)

        # Find stream nearest to input points
        arcpy.Near_analysis(points, STREAMS, searchRadius)
        pointGeometries = []  # Geometry of input points
        distances = []
        startStreamOid = None
        endStreamOid = None
        with arcpy.da.SearchCursor(points, [near_distance_field, nearFidField, 'SHAPE@']) as cursor:
            for row in cursor:
                near_distance, nearFid, point = row
                pointGeometries.append(point)

                if near_distance >= 0:
                    distances.append(near_distance)

                if not startStreamOid:
                    startStreamOid = str(nearFid)
                else:
                    endStreamOid = str(nearFid)

        streamNotFound = len(distances) is not 2
        if streamNotFound:
            makeLine(pointGeometries[0], pointGeometries[1], puntData)

            arcpy.env.outputCoordinateSystem = wgs84
            arcpy.CopyFeatures_management(puntData, tempOutput)

            arcpy.SetParameter(1, tempOutput)
            arcpy.SetParameter(2, puntData)
            arcpy.SetParameter(3, True)
            arcpy.SetParameter(4, '')
            return

        pointToPointDistance = pointGeometries[0].distanceTo(pointGeometries[1])
        if pointToPointDistance < 500:
            pointToPointDistance = 500
        # Create graph of streams within pointToPointDistance of points
        arcpy.MakeFeatureLayer_management(STREAMS, streamsLyr)
        arcpy.SelectLayerByLocation_management(streamsLyr, 'WITHIN_A_DISTANCE', points, pointToPointDistance)
        with arcpy.da.SearchCursor(streamsLyr, ['OID@', 'SHAPE@']) as cursor:
            streamNodes = []
            for row in cursor:
                oid, shape = row
                startPoint = shape.firstPoint
                endPoint = shape.lastPoint
                currentNode = LineNode(oid, startPoint, endPoint)
                for node in streamNodes:
                    if node.is_undirected_connection(startPoint, endPoint):
                        node.add_edge(currentNode.id)
                        currentNode.add_edge(node.id)

                streamNodes.append(currentNode)
        # Find shortest path from one point intersected stream to the other
        shortestP = shortest_path(LineNode.graph, startStreamOid, endStreamOid)
        print shortestP
        # Get line segment between points
        query = "\"{0}\" IN ({1})".format('OBJECTID', ','.join(shortestP))
        arcpy.SelectLayerByAttribute_management(streamsLyr, 'NEW_SELECTION', query)
        arcpy.Dissolve_management(streamsLyr, tempDissolve)
        arcpy.SplitLineAtPoint_management(tempDissolve, points, tempSplit, splitSearchRadius)
        coord1 = pointGeometries[0]
        coord2 = pointGeometries[1]
        found = False
        with arcpy.da.SearchCursor(tempSplit, ["SHAPE@", "OID@"]) as cur:
            for row in cur:
                line = row[0]
                if (coord1.distanceTo(line.firstPoint) < splitSearchRadius and coord2.distanceTo(line.lastPoint) < splitSearchRadius or
                        coord2.distanceTo(line.firstPoint) < splitSearchRadius and coord1.distanceTo(line.lastPoint) < splitSearchRadius):
                    oid = row[1]
                    found = True
                    break

        if found is False:
            arcpy.CreateFeatureclass_management(arcpy.env.scratchGDB, 'puntData', 'POLYLINE', linesTemplate, "", "", utm)

            with arcpy.da.InsertCursor(puntData, ["SHAPE@"]) as c:
                array = arcpy.Array([coord1.firstPoint, coord2.firstPoint])
                c.insertRow([arcpy.Polyline(arcpy.Array(array))])
        else:
            arcpy.MakeFeatureLayer_management(tempSplit, tempLyr, '"OBJECTID" = {0}'.format(oid))
            arcpy.CopyFeatures_management(tempLyr, puntData)

        arcpy.env.outputCoordinateSystem = wgs84
        arcpy.CopyFeatures_management(puntData, tempOutput)

        arcpy.SetParameter(1, tempOutput)
        arcpy.SetParameter(2, puntData)
        arcpy.SetParameter(3, True)
        arcpy.SetParameter(4, '')

    except Exception as ex:
        arcpy.SetParameter(1, linesTemplate)
        arcpy.SetParameter(2, linesTemplate)
        arcpy.SetParameter(3, False)
        arcpy.SetParameter(4, ex.message)


if __name__ == '__main__':
    getSegment()
