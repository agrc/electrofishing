- localhost:8000/_SpecRunner.html
- ui-tests
- ChangeLog.html
- bump version number in main.js
- build.sh
- tag
- update database if needed
- republish the appropriate mxd if needed
- republish toolbox if needed making sure that all paths are correct in the associated scripts
-- copy agrc folder to C:\arcgisserver\directories\arcgissystem\arcgisinput\Wildlife\Toolbox.GPServer\extracted\v101\scripts
- copy new maps to serverprojects
- push app to server

Notes
=====

You will probably need to manually copy the agrc package to the server when publishing the tools for this project. ArcGIS server doesn't copy it automatically. The agrc package goes here: C:\arcgisserver\directories\arcgissystem\arcgisinput\Wildlife\Toolbox.GPServer\extracted\v101\scripts