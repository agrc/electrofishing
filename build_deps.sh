#!/bin/bash
echo 'copying assets'
mkdir src/react-app
mkdir src/react-app/assets
cp _src/react-app/assets/**/*.* src/react-app/assets

echo 'starting babel'
node node_modules/@babel/cli/bin/babel.js --out-dir src/react-toastify node_modules/react-toastify/dist --config-file ./.babelrc
