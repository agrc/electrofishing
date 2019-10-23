from os import path

SAMPLINGEVENTS = 'SamplingEvents'
EVENT_DATE = 'EVENT_DATE'

# BEGIN LOCAL CONFIGS
STREAMS = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde\Electrofishing.WILDADMIN.UDWRStreams')
STATIONS = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde\Electrofishing.WILDADMIN.Stations')
DB = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde')
DATAPATH = path.join(DB, 'Electrofishing.WILDADMIN.')
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
# STREAMS = path.join(path.dirname(__file__), r'Electrofishing_TEST as WILDADMIN.sde\Wildlife.WILDADMIN.UDWRStreams')
# STATIONS = path.join(path.dirname(__file__), r'ELECTROFISHING_TEST as WildAdmin.sde\Wildlife.WILDADMIN.Stations')
# DB = path.join(path.dirname(__file__), r'ELECTROFISHING_TEST as WildAdmin.sde')
# DATAPATH = path.join(DB, 'Wildlife.WILDADMIN.')
# END TEST SERVER CONFIGS

# BEGIN PROD SERVER CONFIGS
# stations = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde\UDWRAquatics.AQUATICSADMIN.Stations'
# END PROD SERVER CONFIGS
