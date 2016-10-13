from os import path

SAMPLINGEVENTS = 'SamplingEvents'
EVENT_DATE = 'EVENT_DATE'

# BEGIN LOCAL CONFIGS
STATIONS = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde\Electrofishing.WILDADMIN.Stations')
DB = path.join(path.dirname(__file__), r'Electrofishing_LOCAL as WILDADMIN.sde')
DATAPATH = path.join(DB, 'Electrofishing.WILDADMIN.')
STREAMS = path.join(DB, 'StreamsNHDHighRes')
WATERBODYIDS = path.join(DB, 'Electrofishing.WILDADMIN.WaterbodyIds_Streams')
# END LOCAL CONFIGS

# BEGIN TEST SERVER CONFIGS
# STATIONS = path.join(path.dirname(__file__), r'Wildlife_TEST as WildAdmin.sde\Wildlife.WILDADMIN.Stations')
# DB = path.join(path.dirname(__file__), r'Wildlife_TEST as WildAdmin.sde')
# DATAPATH = path.join(DB, 'Wildlife.WILDADMIN.')
# STREAMS = path.join(DB, 'StreamsNHDHighRes')
# WATERBODYIDS = path.join(DB, 'Wildlife.WILDADMIN.WaterbodyIds_Streams')
# END TEST SERVER CONFIGS

# BEGIN PROD SERVER CONFIGS
# stations = r'Z:\Documents\Projects\Wildlife\dataentry\scripts\Scripts\UDWRAquatics as AquaticsEdit.sde\UDWRAquatics.AQUATICSADMIN.Stations'
# END PROD SERVER CONFIGS
