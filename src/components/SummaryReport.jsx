import React from 'react';
import config from '../config';
import PropTypes from 'prop-types';

const DECIMAL_PLACES = 2;

function round(value) {
  return Number.parseFloat(value.toFixed(DECIMAL_PLACES));
}
export function getStats(values) {
  values = values.filter((x) => x !== null);

  if (values.length === 0) {
    return { max: null, min: null, avg: null };
  }

  const max = round(Math.max(...values));
  const min = round(Math.min(...values));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  return { max, min, avg: round(avg) };
}

export function getFultons(weights, lengths) {
  return Array(Math.max(weights.length, lengths.length))
    .fill()
    .map((_, i) => {
      const weight = Number.parseFloat(weights[i]);
      const length = Number.parseFloat(lengths[i]);

      if (Number.isNaN(weight) || Number.isNaN(length)) {
        return null;
      }

      const value = (weight / Math.pow(length, 3)) * 100000;

      return round(value);
    });
}

export function getSummaryData(eventData) {
  const speciesContainer = {};
  let numPasses = 0;

  eventData[config.tableNames.fish].forEach((fish) => {
    const species = fish[config.fieldNames.fish.SPECIES_CODE];
    const pass = fish[config.fieldNames.fish.PASS_NUM];

    if (pass > numPasses) {
      numPasses = pass;
    }

    if (!speciesContainer[species]) {
      speciesContainer[species] = {
        name: species,
        counts: {
          [pass]: 1,
        },
        weights: [fish[config.fieldNames.fish.WEIGHT]],
        lengths: [fish[config.fieldNames.fish.LENGTH]],
      };
    } else {
      if (!speciesContainer[species].counts[pass]) {
        speciesContainer[species].counts[pass] = 1;
      } else {
        speciesContainer[species].counts[pass] += 1;
      }

      speciesContainer[species].weights.push(fish[config.fieldNames.fish.WEIGHT]);
      speciesContainer[species].lengths.push(fish[config.fieldNames.fish.LENGTH]);
    }
  });

  return {
    species: Object.values(speciesContainer).map((species) => {
      return {
        name: species.name,
        counts: species.counts,
        weight: getStats(species.weights),
        length: getStats(species.lengths),
        fulton: getStats(getFultons(species.weights, species.lengths)),
      };
    }),
    numPasses,
  };
}

function SummaryReport({ show, onHide, eventData, onConfirm }) {
  const modalRef = React.useRef(null);
  const [summaryData, setSummaryData] = React.useState(null);

  React.useEffect(() => {
    $(modalRef.current).modal({ backdrop: 'static', keyboard: false, show: false });
  }, []);

  React.useEffect(() => {
    if (show) {
      $(modalRef.current).modal('show');
    } else {
      $(modalRef.current).modal('hide');
    }
  }, [show]);

  React.useEffect(() => {
    if (eventData && show) {
      setSummaryData(getSummaryData(eventData));
    }
  }, [eventData, show]);

  return (
    <div>
      <div className="modal fade" role="dialog" ref={modalRef}>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={onHide}>
                <span aria-hidden="true">&times;</span>
              </button>
              <h4>Report Summary</h4>
            </div>
            <div className="modal-body">
              {summaryData ? (
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th></th>
                      <th className="centered" colSpan={3}>
                        Fulton&apos;s Condition Factor
                      </th>
                      <th className="centered" colSpan={3}>
                        Weight
                      </th>
                      <th className="centered" colSpan={3}>
                        Length
                      </th>
                      <th className="centered" colSpan={3}>
                        Counts by Pass
                      </th>
                    </tr>
                  </thead>
                  <thead>
                    <tr>
                      <th>Species</th>
                      <th>Max</th>
                      <th>Min</th>
                      <th>Avg</th>
                      <th>Max</th>
                      <th>Min</th>
                      <th>Avg</th>
                      <th>Max</th>
                      <th>Min</th>
                      <th>Avg</th>
                      {Array.from({ length: summaryData.numPasses }).map((_, i) => (
                        <th key={i}>#{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.species.map((s) => (
                      <tr key={s.name}>
                        <th>{s.name}</th>

                        {/* Fulton's */}
                        <Stats data={s.fulton} />

                        {/* Weight */}
                        <Stats data={s.weight} />

                        {/* Length */}
                        <Stats data={s.length} />

                        {/* Count by Pass */}
                        {Array(summaryData.numPasses)
                          .fill()
                          .map((_, i) => (
                            <td key={i}>{s.counts[i + 1]}</td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-default" onClick={onHide}>
                Cancel
              </button>
              <button type="button" className="btn btn-success" data-testid="summaryConfirmBtn" onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SummaryReport.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  eventData: PropTypes.object,
  onConfirm: PropTypes.func.isRequired,
};

function Stats({ data }) {
  return (
    <>
      <td>{data.max}</td>
      <td>{data.min}</td>
      <td>{data.avg}</td>
    </>
  );
}

Stats.propTypes = {
  data: PropTypes.object.isRequired,
};

export default SummaryReport;
