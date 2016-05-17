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

from agrc import email, logging

# had to make a copy of the .sde files because server was choking on it being reference
# in multiple scripts.

# BEGIN LOCAL CONFIGS
# db = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\Wildlife_LOCAL2.sde'
# dataPath = r'{}/WILDLIFE.DBO.'.format(db)
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
# db = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\Wildlife_TEST as WildAdmin2.sde'
# dataPath = r'{}/WILDLIFE.WILDADMIN.'.format(db)
# END TEST SERVER CONFIGS

# BEGIN PROD SERVER CONFIGS
db = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde'
dataPath = r'{}/UDWRAquatics.AQUATICSADMIN.'.format(db)
# END PROD SERVER CONFIGS

logger = logging.Logger(addLogsToArcpyMessages=True)
emailer = email.Emailer('stdavis@utah.gov')


def appendData(paramIndex, fc):
    logger.logMsg('appending data to: {}'.format(fc))
    
    featureSet = arcpy.GetParameterAsText(paramIndex)
    arcpy.Append_management(featureSet, dataPath + fc, 'NO_TEST')
    
try:
    edit = arcpy.da.Editor(db)
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
    
    logger.logMsg('script finished successfully!')
    
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