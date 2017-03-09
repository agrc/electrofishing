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
    segment in utm for later submission to the NewCollectionEvent service
success(5): boolean
    true if a segment was successfully returned
error_message(6): string
    only populated if success is false
"""

import arcpy
from os import path
from dijkstras import *
from settings import *


# get parameters
point_input = arcpy.GetParameterAsText(0)
distance = arcpy.GetParameterAsText(1)
direction = arcpy.GetParameterAsText(2)  # up or down
# point_input = r'C:\giswork\temp\electrofishing.gdb\Start_Fork'
# distance = 900
# direction = 'up'

# folders and data
wgs84 = arcpy.SpatialReference('WGS 1984')
utm = arcpy.SpatialReference('NAD 1983 UTM Zone 12N')
lines_template = path.join(path.dirname(__file__), '..\ToolData\InputSchemas.gdb\lines')
in_memory = 'in_memory'

# temp data
temp_dissolve = r'{0}\temp_dissolve'.format(in_memory)
temp_split = r'{0}\temp_split'.format(in_memory)
out_wgs = r'{0}\out_wgs'.format(arcpy.env.scratchGDB)
out_data = r'{0}\out_data'.format(arcpy.env.scratchGDB)

streams_lyr = 'streamsLyr'

# tool parameters
search_radius = '100 Meters'

# fields
near_distance_field = 'NEAR_DIST'
near_fid_field = 'NEAR_FID'

for ds in [temp_dissolve, temp_split, out_data, out_wgs]:
    if arcpy.Exists(ds):
        arcpy.Delete_management(ds)

try:
    distance = int(distance)
except:
    raise Exception('Invalid value passed for distance parameter: {0}.'.format(distance))
if direction not in ['up', 'down']:
    raise Exception('Invalid value passed for direction parameter: {0}.'.format(direction))


def getSegment():
    for ds in [temp_dissolve, temp_split, out_data, out_wgs]:
        if arcpy.Exists(ds):
            arcpy.Delete_management(ds)

    # Find stream nearest to input point
    arcpy.Near_analysis(point_input, STREAMS, search_radius)
    start_stream_oid = None
    near_distance, near_fid, point_geometry = (None, None, None)
    with arcpy.da.SearchCursor(point_input, [near_distance_field, near_fid_field, 'SHAPE@']) as cursor:
        for row in cursor:
            near_distance, near_fid, point_geometry = row
            start_stream_oid = str(near_fid)

    if near_distance is None or near_distance == -1:
        raise Exception('No stream segments within {} of start point!'.format(search_radius))
        return

    search_lines_distance = distance
    if search_lines_distance < 500:
        search_lines_distance = 500
    # Create graph of streams within search_lines_distance of points
    arcpy.MakeFeatureLayer_management(STREAMS, streams_lyr)
    arcpy.SelectLayerByLocation_management(streams_lyr, 'WITHIN_A_DISTANCE', point_input, search_lines_distance)
    with arcpy.da.SearchCursor(streams_lyr, ['OID@', 'SHAPE@']) as cursor:
        stream_nodes = []
        for row in cursor:
            oid, shape = row
            start_point = shape.firstPoint
            end_point = shape.lastPoint
            current_node = LineNode(oid, start_point, end_point, shape.length)
            for node in stream_nodes:
                if direction == 'up':
                    if node.is_directed_connection(current_node.end, node.start):
                        node.add_edge(current_node.id, current_node.line_length)
                    if current_node.is_directed_connection(node.end, current_node.start):
                        current_node.add_edge(node.id, node.line_length)
                else:
                    if node.is_directed_connection(current_node.start, node.end):
                        node.add_edge(current_node.id, current_node.line_length)
                    if current_node.is_directed_connection(node.start, current_node.end):
                        current_node.add_edge(node.id, node.line_length)

            stream_nodes.append(current_node)
    # find path and distance to connected features
    distance_paths = dijkstra_path_predecessors(LineNode.graph, start_stream_oid)
    feature_distances, predecessors = distance_paths

    end_stream_oid = None
    closest = None
    for feature in feature_distances:
        dist = feature_distances[feature]
        closeness = dist - distance
        if not closest or \
                (closeness >= 0 and (closeness < closest or closest < 0)) or \
                (closest < 0 and closeness > closest):
                    closest = closeness
                    end_stream_oid = feature

    selection_ids = get_predecessor_ids(end_stream_oid, start_stream_oid, predecessors)

    query = "\"{0}\" IN ({1})".format('OBJECTID', ','.join(selection_ids))
    arcpy.SelectLayerByAttribute_management(streams_lyr, 'NEW_SELECTION', query)
    dissovle_line = arcpy.Dissolve_management(streams_lyr, arcpy.Geometry())
    if len(dissovle_line) > 1:
        raise Exception('Stream feature could not be created')
    else:
        dissovle_line = dissovle_line[0]
    start_distance = dissovle_line.queryPointAndDistance(point_geometry)[1]
    if direction == 'up':
        end_distance = start_distance - distance
        if end_distance < 0:
            end_distance = 0
        start_distance, end_distance = end_distance, start_distance
    else:
        end_distance = start_distance + distance
        if end_distance > dissovle_line.length:
            end_distance = dissovle_line.length

    print start_distance, end_distance, end_stream_oid
    output_line = dissovle_line.segmentAlongLine(start_distance, end_distance)
    arcpy.CopyFeatures_management(output_line, out_data)
    arcpy.env.outputCoordinateSystem = wgs84
    arcpy.CopyFeatures_management(out_data, out_wgs)

    arcpy.SetParameter(4, out_data)
    arcpy.SetParameter(3, out_wgs)
    arcpy.SetParameter(5, True)
    arcpy.SetParameter(6, '')


if __name__ == '__main__':
    try:
        getSegment()
    except Exception as ex:
        arcpy.SetParameter(3, lines_template)
        arcpy.SetParameter(4, lines_template)
        arcpy.SetParameter(5, False)
        arcpy.SetParameter(6, ex.message)
