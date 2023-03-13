import 'dotenv/config';
import initProxy from 'firebase-auth-arcgis-server-proxy';
import functions from 'firebase-functions';

const options = {
  host: process.env.AGS_HOST,
  mappings: [
    {
      from: /^\/toolbox/,
      to: '/arcgis/rest/services/Electrofishing/Toolbox/GPServer',
      secrets: 'ARCGIS_SERVER_CREDENTIALS',
    },
    {
      from: /^\/mapservice/,
      to: '/arcgis/rest/services/Electrofishing/MapService/FeatureServer',
      secrets: 'ARCGIS_SERVER_CREDENTIALS',
    },
    {
      from: /^\/reference/,
      to: '/arcgis/rest/services/Electrofishing/Reference/MapServer',
      secrets: 'ARCGIS_SERVER_CREDENTIALS',
    },
  ],
  claimsCheck: (claims) => {
    if (process.env.FUNCTIONS_EMULATOR) {
      return true;
    }

    const utahIDEnvironments = {
      prod: 'Prod',
      stage: 'AT',
      development: 'Dev',
    };

    return (
      claims.firebase?.sign_in_attributes?.['DWRElectroFishing:AccessGranted'] &&
      claims.firebase.sign_in_attributes['DWRElectroFishing:AccessGranted'].includes(
        utahIDEnvironments[process.env.ENVIRONMENT]
      )
    );
  },
};

const [proxy, secrets] = initProxy(options);

export const maps = functions.runWith({ secrets, invoker: 'public' }).https.onRequest(proxy);
