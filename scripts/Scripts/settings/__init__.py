from os import path
from . import secrets
import arcpy

arcpy.AddMessage('init')
USERNAME = secrets.USERNAME
PASSWORD = secrets.PASSWORD
INSTANCE = secrets.INSTANCE

SAMPLINGEVENTS = 'SamplingEvents'
EVENT_DATE = 'EVENT_DATE'

# BEGIN LOCAL CONFIGS
# STREAMS = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde\Electrofishing.WILDADMIN.UDWRStreams')
# STATIONS = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde\Electrofishing.WILDADMIN.Stations')
# DB = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde')
# DATAPATH = path.join(DB, 'Electrofishing.WILDADMIN.')
# DATABASE_NAME = 'Electrofishing'
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
STREAMS = path.join(
    path.dirname(__file__),
    r'Electrofishing_Staging@WildAdmin.sde\Electrofishing.WILDADMIN.UDWRStreams'
)
STATIONS = path.join(
    path.dirname(__file__),
    r'Electrofishing_Staging@WildAdmin.sde\Electrofishing.WILDADMIN.Stations')
DB = path.join(path.dirname(__file__), r'Electrofishing_Staging@WildAdmin.sde')
DATAPATH = path.join(DB, 'Electrofishing.WILDADMIN.')
DATABASE_NAME = 'Electrofishing'
# END TEST SERVER CONFIGS

# BEGIN PROD SERVER CONFIGS
# STREAMS = path.join(path.dirname(__file__), r'ELECTROFISHING_Prod as WildAdmin.sde\Electrofishing.WILDADMIN.UDWRStreams')
# STATIONS = path.join(path.dirname(__file__), r'ELECTROFISHING_Prod as WildAdmin.sde\Electrofishing.WILDADMIN.Stations')
# DB = path.join(path.dirname(__file__), r'ELECTROFISHING_Prod as WildAdmin.sde')
# DATAPATH = path.join(DB, 'Electrofishing.WILDADMIN.')
# DATABASE_NAME = 'Electrofishing'
# END PROD SERVER CONFIGS
