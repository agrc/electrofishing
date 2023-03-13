import { useState } from 'react';
import StreamSearch from './StreamSearch.jsx';

const story = {
  title: 'StreamSearch',
  component: StreamSearch,
};

export default story;

const streamsFeatureService =
  'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStreamsNHD/FeatureServer/0';
const lakesFeatureService =
  'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahLakesNHD/FeatureServer/0';
const searchField = 'GNIS_Name';
const contextField = 'FType_Text';

export const Default = () => {
  const [showLoader, setShowLoader] = useState(false);
  const [fitBounds, setFitBounds] = useState('');
  const map = {
    showLoader: () => setShowLoader(true),
    hideLoader: () => setShowLoader(false),
    fitBounds: (bounds) => setFitBounds(JSON.stringify(bounds)),
    addLayer: () => {},
  };

  return (
    <>
      <StreamSearch
        map={map}
        streamsFeatureService={streamsFeatureService}
        lakesFeatureService={lakesFeatureService}
        searchField={searchField}
        contextField={contextField}
      />
      <p>fitBounds: {fitBounds}</p>
      {showLoader && <p>loading...</p>}
    </>
  );
};
