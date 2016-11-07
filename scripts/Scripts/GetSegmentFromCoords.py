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


# get parameters
points = arcpy.GetParameterAsText(0)
# points = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\ToolData\TestData.gdb\StartEnd4'

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
searchRadius = '150 Meters'
splitSearchRadius = 10

# fields
fldReachCode = 'ReachCode'

try:
    for ds in [tempDissolve, tempSplit, tempOutput, puntData]:
        if arcpy.Exists(ds):
            arcpy.Delete_management(ds)

    arcpy.Snap_edit(points, [[STREAMS, 'EDGE', searchRadius]])

    arcpy.MakeFeatureLayer_management(STREAMS, streamsLyr)

    arcpy.SelectLayerByLocation_management(streamsLyr, 'INTERSECT', points)

    values = [row[0] for row in arcpy.da.SearchCursor(streamsLyr, [fldReachCode])]
    lenValues = len(values)
    if lenValues == 0:
        raise Exception('No stream segments selected by snapped points!')
    rcodes = set(values)
    numCodes = len(rcodes)
    if numCodes == 0:
        raise Exception('No reach codes found!')
    query = "\"{0}\" IN ('{1}')".format(fldReachCode, "','".join(rcodes))
    arcpy.SelectLayerByAttribute_management(streamsLyr, 'NEW_SELECTION', query)

    arcpy.Dissolve_management(streamsLyr, tempDissolve)

    arcpy.SplitLineAtPoint_management(tempDissolve, points, tempSplit, splitSearchRadius)

    with arcpy.da.SearchCursor(points, ["SHAPE@", "OID@"]) as cur:
        coord1 = cur.next()[0]
        coord2 = cur.next()[0]

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
        # this is called punting :)

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
