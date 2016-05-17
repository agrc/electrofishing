"""
New Station GP Service for Wildlife Project

Accepts a new station to append to the station feature class. Adds some additional data
to the feature before appending it.

GP Parameters:
*input
station(0): FeatureSet
*ouput ??

Scott Davis (stdavis@utah.gov)
Nov 2012
"""

import arcpy
from agrc import logging, email

# BEGIN LOCAL CONFIGS
# stations = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\Wildlife_LOCAL.sde\Wildlife.DBO.Stations'
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
# stations = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\Wildlife_TEST as WildAdmin.sde\Wildlife.WILDADMIN.Stations'
# END TEST SERVER CONFIGS

# BEGIN PROD SERVER CONFIGS
stations = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde\UDWRAquatics.AQUATICSADMIN.Stations'
# END PROD SERVER CONFIGS

# set up logging and email
logger = logging.Logger(addLogsToArcpyMessages=True)
emailer = email.Emailer('stdavis@utah.gov')

# get Parameters
point = arcpy.GetParameterAsText(0)

# folders and data
layer = 'layer'

try:
    logger.logMsg('appending to stations feature class')
    arcpy.Append_management(point, stations, "NO_TEST")

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