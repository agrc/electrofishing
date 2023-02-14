#!/bin/bash
echo 'copying assets'
mkdir src/react-app
mkdir src/react-app/assets
cp _src/react-app/assets/**/*.* src/react-app/assets

export NODE_ENV=production

echo 'starting babel'
node node_modules/@babel/cli/bin/babel.js --out-dir src/react-toastify node_modules/react-toastify/dist --config-file ./.babelrc

echo 'using esbuild to bundle service worker'
./node_modules/.bin/esbuild _src/ServiceWorker.js --bundle --outfile=src/ServiceWorker.js --define:process.env.REACT_APP_FIREBASE_CONFIG=$(npx dotenv -p REACT_APP_FIREBASE_CONFIG)
