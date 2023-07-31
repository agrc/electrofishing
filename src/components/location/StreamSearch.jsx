import clsx from 'clsx';
import { useCombobox } from 'downshift';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';

const maxResultsToDisplay = 50;
const fetchOptions = {
  handleAs: 'json',
};
const getLatLngs = (graphic) => {
  // summary:
  //      description
  // graphic: {}
  const prop = graphic.geometry.type === 'polygon' ? 'rings' : 'paths';

  return graphic.geometry[prop][0].map(function (p) {
    return [p[1], p[0]];
  });
};

export default function StreamSearch({ map, streamsFeatureService, lakesFeatureService, searchField, contextField }) {
  const [inputItems, setInputItems] = useState([]);
  const [message, setMessage] = useState(null);
  const [showMaxMessage, setShowMaxMessage] = useState(false);
  const defaultQuery = useMemo(() => {
    return {
      returnGeometry: false,
      outFields: `${searchField},${contextField}`,
      f: 'json',
      outSR: JSON.stringify({ wkid: 4326 }),
    };
  }, [contextField, searchField]);

  const onSelectedItemChange = async ({ selectedItem }) => {
    // clear any old graphics
    streamsLayer.current.setLatLngs([]);
    lakesLayer.current.setLatLngs([]);

    if (!selectedItem) return;

    const contextValue = selectedItem.attributes[contextField];
    const query = { ...defaultQuery };
    if (contextValue.length > 0) {
      query.where = `${searchField} = '${selectedItem.attributes[searchField]}' AND ${contextField} = '${contextValue}'`;
    } else {
      query.where = `${searchField} = '${selectedItem.attributes[searchField]}' AND ${contextField} IS NULL`;
    }

    query.returnGeometry = true;
    const response = await fetch(`${selectedItem.queryUrl}?${new URLSearchParams(query)}`);
    const featureSet = await response.json();
    const features = featureSet.features.map((f) => {
      f.geometry.type = featureSet.geometryType === 'esriGeometryPolygon' ? 'polygon' : 'polyline';

      return f;
    });

    if (features.length === 0) {
      throw new Error(`No features found for query: ${query.where}!`);
    }

    if (features.length === 1 || features[0].geometry.type === 'polygon') {
      const layer = features[0].geometry.type === 'polygon' ? lakesLayer.current : streamsLayer.current;
      layer.setLatLngs(getLatLngs(features[0]));
      map.fitBounds(layer.getBounds().pad(0.1));
    } else {
      const layer = features[0].geometry.type === 'polygon' ? lakesLayer.current : streamsLayer.current;
      const lls = features.map((g) => getLatLngs(g));
      layer.setLatLngs(lls);
      map.fitBounds(layer.getBounds().pad(0.1));
    }
  };

  const { isOpen, getMenuProps, getInputProps, highlightedIndex, getItemProps, inputValue } = useCombobox({
    items: inputItems,
    onInputValueChange: async ({ inputValue }) => {
      setInputItems(await await getItems(inputValue));
    },
    itemToString: (item) => item.attributes[searchField],
    onSelectedItemChange,
  });

  const streamsLayer = useRef();
  const lakesLayer = useRef();
  const groupLayer = useRef();
  useEffect(() => {
    if (!map) return;

    // init layers
    streamsLayer.current = new L.Polyline([], {
      color: 'yellow',
      opacity: 0.5,
    });
    lakesLayer.current = new L.Polygon([], {
      color: 'yellow',
      opacity: 0.5,
    });
    groupLayer.current = new L.LayerGroup([streamsLayer.current, lakesLayer.current]).addTo(map);
  }, [map]);

  const removeDuplicateResults = (features) => {
    // summary:
    //      Removes duplicates from the set of features.
    // features: Object[]
    //      The array of features that need to be processed.
    // returns: Object[]
    //      The array after it has been processed.
    // tags:
    //      private

    var list = [];
    features.forEach((f) => {
      if (
        list.some((existingF) => {
          if (existingF.attributes[searchField] === f.attributes[searchField]) {
            if (contextField) {
              if (existingF.attributes[contextField] === f.attributes[contextField]) {
                return true;
              } else {
                return false;
              }
            } else {
              return true;
            }
          } else {
            return false;
          }
        }) === false
      ) {
        // add item
        list.push(f);
      }
    });

    return list;
  };

  const sortArray = (list) => {
    // summary:
    //      Sorts the array by both the searchField and contextField
    //      if there is a contextField specified. If no context field is
    //      specified, no sorting is done since it's already done on the server
    //      with the 'ORDER BY' statement. I tried to add a second field to the
    //      'ORDER BY' statement but ArcGIS Server just choked.

    // custom sort function
    function sortFeatures(a, b) {
      if (a.attributes[searchField] === b.attributes[searchField]) {
        if (a.attributes[contextField] < b.attributes[contextField]) {
          return -1;
        }

        return 1;
      } else if (a.attributes[searchField] < b.attributes[searchField]) {
        return -1;
      }

      return 1;
    }

    // sort features
    return list.sort(sortFeatures);
  };

  const processResults = async (responses) => {
    // summary:
    //      Processes the features returned from the query tasks.

    const featureSets = [await responses[0].json(), await responses[1].json()];

    // combine features and add layer props
    let features = [];
    const addLayerProp = (featureSet, url) => {
      featureSet.forEach(function (f) {
        f.queryUrl = url;
        features.push(f);
      });
    };
    addLayerProp(featureSets[0].features, `${streamsFeatureService}/query`);
    addLayerProp(featureSets[1].features, `${lakesFeatureService}/query`);

    // remove duplicates
    features = sortArray(removeDuplicateResults(features));

    // get number of unique results
    const num = features.length;
    console.info(`${num} unique results.`);

    if (map.hideLoader) {
      map.hideLoader();
    }

    setShowMaxMessage(false);
    setMessage(null);
    if (num > maxResultsToDisplay) {
      setShowMaxMessage(true);

      return features.slice(0, maxResultsToDisplay - 1);
    } else if (num === 0) {
      setMessage('There are no matches.');
    } else {
      return features;
    }

    return [];
  };

  const controller = useRef(null);
  const getItems = async (searchString) => {
    // return if not enough characters
    if (searchString.length < 1) {
      setMessage(null);

      return [];
    }

    if (map.showLoader) {
      map.showLoader();
    }

    // update query where clause
    const query = {
      ...defaultQuery,
      returnGeometry: false,
      where: `UPPER(${searchField}) LIKE UPPER('${searchString}%')`,
    };

    // execute query / canceling any previous query
    if (controller.current) {
      controller.current.abort();
    }

    controller.current = new AbortController();
    fetchOptions.signal = controller.current.signal;

    try {
      const promises = [
        fetch(`${streamsFeatureService}/query?${new URLSearchParams(query)}`, fetchOptions),
        fetch(`${lakesFeatureService}/query?${new URLSearchParams(query)}`, fetchOptions),
      ];

      const responses = await Promise.all(promises);

      return await processResults(responses);
    } catch (error) {
      // swallow errors from cancels
      if (error.name !== 'AbortError') {
        setMessage(`StreamSearch ArcGISServerError: ${error.message}`);
      }

      if (map.hideLoader) {
        map.hideLoader();
      }

      return [];
    }
  };

  return (
    <div className="magic-zoom">
      <div className="row">
        <div className="input-group">
          <input
            className="form-control"
            placeholder="stream/lake name"
            type="text"
            name="stream search"
            data-testid="stream-search"
            {...getInputProps()}
          />
          <span className="input-group-addon">
            <span className="glyphicon glyphicon-search"></span>
          </span>
        </div>
        <div className="matches-table dropdown" {...getMenuProps()}>
          {isOpen && inputItems.length > 0 && (
            <ul className="dropdown-menu">
              {inputItems.map((item, index) => {
                const matchString = item.attributes[searchField];
                const sliceIndex = inputValue.length;

                return (
                  <li
                    className={clsx('match', highlightedIndex === index && 'highlighted-row')}
                    key={`${item}${index}`}
                    {...getItemProps({ item, index })}
                  >
                    <div className="first-cell">
                      {matchString.slice(0, sliceIndex)}
                      <b>{matchString.slice(sliceIndex)}</b>
                    </div>
                    <div className="county-cell">{item.attributes[contextField] ?? ''}</div>
                    <div style={{ clear: 'both' }}></div>
                  </li>
                );
              })}
              {showMaxMessage ? (
                <li className="dropdown-header">{`More than ${maxResultsToDisplay} matches found...`}</li>
              ) : null}
            </ul>
          )}
          {message ? (
            <ul className="dropdown-menu">
              <li className="dropdown-header">{message}</li>
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}

StreamSearch.propTypes = {
  map: PropTypes.instanceOf(L.Map),
  streamsFeatureService: PropTypes.string.isRequired,
  lakesFeatureService: PropTypes.string.isRequired,
  searchField: PropTypes.string.isRequired,
  contextField: PropTypes.string.isRequired,
};
