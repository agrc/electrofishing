# electrofishing
Application for recording electrofishing surveys. Built for DWR.

# Database
- All feature classes and tables should be registered as versioned with the option to move edits to base except for StreamsNHDHighRes & WaterbodyIds_Streams.

# Deployment
1. Publish `maps/MapService.mxd` as `Electrofishing/MapService`
    - Feature service
1. Publish all tools in `scripts/Toolbox.tbx` as `Electrofishing/Toolbox`
    - Most of the test data for running the tools is in `scripts/ToolData/TestData.gdb`
    - `GetSegmentFromID`
        - `reachcode`: `16020304000426`
    - `NewCollectionEvent`
        - Test Input: `scripts/Scripts/TestData/NewCollectionEventData.json` (may need to remove all line breaks)
    - You'll likely need to manually copy `scripts/Scripts/settings/` to the server since it doesn't get copied when publishing.
