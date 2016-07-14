"""
New Station GP Service for Wildlife Project

Accepts a new station to append to the station feature class. Adds some additional data
to the feature before appending it.

Update: Not sure why this is still a gp task. Why not just send data directly to feature service?

GP Parameters:
*input
station(0): FeatureSet
*ouput ??
"""

import arcpy
from settings import *

# get Parameters
point = arcpy.GetParameterAsText(0)

# folders and data
layer = 'layer'

arcpy.Append_management(point, STATIONS, "NO_TEST")
