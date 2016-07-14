"""
New Collection Event Service for Wildlife Project

Accepts a JSON object with all collection event and related data.

GP Parameters:
*input
samplingEvent(0): FeatureSet
backpacks(1): FeatureSet
canoesBarges(2): FeatureSet
raftsBoats(3): FeatureSet
fish(4): FeatureSet
diet(5): FeatureSet
health(6): FeatureSet
tags(7): FeatureSet
habitat(8): FeatureSet

"""
import arcpy
from settings import *


def appendData(paramIndex, fc):
    featureSet = arcpy.GetParameterAsText(paramIndex)
    arcpy.Append_management(featureSet, DATAPATH + fc, 'NO_TEST')

edit = arcpy.da.Editor(DB)
edit.startEditing(False)
try:
    edit.startOperation()
    appendData(0, 'SamplingEvents')
    appendData(1, 'Backpacks')
    appendData(2, 'CanoesBarges')
    appendData(3, 'RaftsBoats')
    appendData(4, 'Fish')
    appendData(5, 'Diet')
    appendData(6, 'Health')
    appendData(7, 'Tags')
    appendData(8, 'Habitat')
    edit.stopOperation()
    edit.stopEditing(True)
except Exception as e:
    edit.stopOperation()
    edit.stopEditing(False)
    raise e
