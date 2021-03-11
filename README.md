# Electrofishing [![Build Status](https://travis-ci.com/agrc/electrofishing.svg?branch=master)](https://travis-ci.com/agrc/electrofishing)

Application for recording electrofishing surveys. Built for DWR.

Staging: [https://dwrapps.dev.utah.gov/fishsample/dataentry/](https://dwrapps.dev.utah.gov/fishsample/dataentry/)

Production: [https://dwrapps.utah.gov/fishsample/dataentry/](https://dwrapps.utah.gov/fishsample/dataentry/)

## Database

- [Database Design](https://docs.google.com/spreadsheets/d/1_LhNljqvb9GMxpMWlx_CnQo9FuZ5MNwoO3jzTORcxn0/edit#gid=0)
- XML Workspace Document: `data/DATABASESCHEMA.XML`

### Installation

- [Create SDE database](http://wiki.agrc.utah.gov/sql-server-set-up-on-dev-machine/)
- Save connection as `Electrofishing_LOCAL as WILDADMIN.sde`
- right click > `import xml yada yada`
- Reference xml file above
- Register all feature classes and tables as versioned _without_ the option to move edits direct to base

## Deployment

1. Publish `maps/MapService.mxd` as `Electrofishing/MapService` (making sure that it is pointed at the correct database)
   1. max number of records returned: 5000
   1. feature access: create, query and update
   1. dynamic workspace referencing the sde database ID: ElectrofishingQuery
1. Publish `maps/Reference.mxd` as `Electrofishing/Reference` (making sure that it is pointed at the correct database)
1. `pip install pyodbc` into ArcGIS Server python instance.
1. Install ODBC Driver 17 for SQL Server.
1. Update `scripts/Scripts/settings/__init__.py`.
1. Create `scripts/Scripts/settings/secrets.py`.
1. Publish all tools in `scripts/Toolbox.tbx` as `Electrofishing/Toolbox` **Requires ArcGIS Server Advanced**
   1. `Synchronous`
   1. `GetSegmentFromCoords`
      - `points`: `scripts\ToolData\TestData.gdb\StartEnd_fork`
   1. `GetSegmentFromStartDistDirt`
      - `point`: `scripts\ToolData\TestData.gdb\Start1`
      - `distance`: `1`
      - `direction`: `up`
   1. `NewCollectionEvent`
      - Test Input: **copy paste contents of** `scripts/Scripts/TestData/NewCollectionEventData.json` (minified)
   1. Copy `scripts/Scripts/settings` & `dijkstras.py` to `<ArcGISServerDirectory>directories\arcgissystem\arcgisinput\Electrofishing\Toolbox.GPServer\extracted\v101\scripts`.
1. `npm run build` or `npm run build-stage`
1. `npm run deploy` (builds a zip file to send to DWR) or `npm run deploy-stage` or `npm run deploy-stage-app-only` (deploys only the `app` and `react-app` packages) (much faster via VPN)

## Test Deployment

1. Credentials are in the agrc wiki
2. Deleting all feature classes and tables
3. Reimport schema from the xml file

## Development

`npm start` and open [http://localhost:8000/src/](http://localhost:8000/src/)

### Storybook

`npm run storybook` (requires `npm start` to already be running)
