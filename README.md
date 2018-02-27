[![Build Status](https://travis-ci.org/agrc/electrofishing.svg?branch=master)](https://travis-ci.org/agrc/electrofishing)

# electro fishing
Application for recording electrofishing surveys. Built for DWR.

# Database
- [Database Design](https://docs.google.com/spreadsheets/d/1_LhNljqvb9GMxpMWlx_CnQo9FuZ5MNwoO3jzTORcxn0/edit#gid=0)
- XML Workspace Document: `data/DATABASESCHEMA.XML`

#### Installation
- [Create SDE database](http://wiki.agrc.utah.gov/sql-server-set-up-on-dev-machine/)
- Save connection as `Electrofishing_LOCAL as WILDADMIN.sde`
- right click > `import xml yada yada`
- Reference xml file above
- Register all feature classes and tables as versioned with the option to move edits

# Deployment
1. Publish `maps/MapService.mxd` as `Electrofishing/MapService`
1. Publish `maps/Reference.mxd` as `Electrofishing/Reference`
2. Copy `Electrofishing_Local as WILDADMIN.sde` to `scripts/settings`
- Update `scripts/Scripts/settings/__init__.py`.
1. Publish all tools in `scripts/Toolbox.tbx` as `Electrofishing/Toolbox`
    - **Requires ArcGIS Server Advanced**
    - Most of the test data for running the tools is in `scripts/ToolData/TestData.gdb`
    - `GetSegmentFromID`
        - `reachcode`: `16020102000938`
    - `NewCollectionEvent`
        - Test Input: **copy paste contents of** `scripts/Scripts/TestData/NewCollectionEventData.json` (minified)

##### You'll likely need to manually copy `scripts/Scripts/settings/` to the server since it doesn't get copied when publishing.
