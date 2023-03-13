# Electrofishing

Application for recording electrofishing surveys. Built for DWR.

Staging: [https://electrofishing.dev.utah.gov](https://electrofishing.dev.utah.gov)

Production: [https://electrofishing.ugrc.utah.gov](https://electrofishing.ugrc.utah.gov)

## Database

- [Database Design](https://docs.google.com/spreadsheets/d/1_LhNljqvb9GMxpMWlx_CnQo9FuZ5MNwoO3jzTORcxn0/edit#gid=0)
- XML Workspace Document: `data/DATABASESCHEMA.XML`

### Installation

- Create SDE database
- Save connection as `Electrofishing_LOCAL as WILDADMIN.sde`
- right click > `import xml yada yada`
- Reference xml file above
- Register all feature classes and tables as versioned _without_ the option to move edits direct to base

## Deployment

1. Publish `maps/MapService` as `Electrofishing/MapService`
   1. This map and "Reference" below are pointed at the staging database and will be mapped to production when published to the prod server.
   1. max number of records returned: 5000
   1. feature access: create, query and update
   1. dynamic workspace referencing the sde database ID: ElectrofishingQuery
1. Publish `maps/Reference` as `Electrofishing/Reference`
1. Update `scripts/Scripts/settings/__init__.py`.
1. Create `scripts/Scripts/settings/secrets.py`.
1. Publish all tools in `scripts/Toolbox.tbx` as `Electrofishing/Toolbox` **Requires ArcGIS Server Advanced**
   1. `GetSegmentFromCoords`
      - `points`: `scripts\ToolData\TestData.gdb\StartEnd_fork`
   1. `GetSegmentFromStartDistDirt`
      - `point`: `scripts\ToolData\TestData.gdb\Start1`
      - `distance`: `1`
      - `direction`: `up`
   1. `NewCollectionEvent`
      - Test Input: **copy paste contents of** `scripts/Scripts/TestData/NewCollectionEventData.json` (minified)
      - `Synchronous`
      - Copy `scripts/Scripts/settings` & `dijkstras.py` to `<ArcGISServerDirectory>directories\arcgissystem\arcgisinput\Electrofishing\Toolbox.GPServer\extracted\v101\scripts`.
1. Releases to Firebase are deployed via GitHub Actions.

### Cutting a new release

1. Merge release PR
1. Republish Map and/or GP services, if needed (see steps above).

## Development

`npm start` and open [http://localhost:5173/](http://localhost:5173/)

### Storybook

`npm run storybook` (requires `npm start` to already be running)
