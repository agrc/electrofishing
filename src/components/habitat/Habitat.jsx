import React from 'react';
import config from '../../config';
import { actionTypes, useSamplingEventContext } from '../../hooks/samplingEventContext.jsx';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import NumericInputValidator from '../NumericInputValidator.jsx';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import GridTab from '../GridTab.jsx';
import DataGridAddDeleteButtons from '../DataGridAddDeleteButtons.jsx';
import DataGrid, { DomainDrivenDropdownCell, NumericInputCell } from '../DataGrid.jsx';

const fnHabitat = config.fieldNames.habitat;
const fnMeasurements = config.fieldNames.transectMeasurements;

const HabitatNumericInput = ({ min, max, step, label, field, value }) => {
  const { eventDispatch } = useSamplingEventContext();

  return (
    <NumericInputValidator>
      {(getInputProps, getGroupClassName, validationMessage) => (
        <div className={getGroupClassName('form-group')}>
          <label className="control-label">{label}</label>
          <input
            min={min}
            max={max}
            step={step}
            value={value || ''}
            id={`${field}_input`}
            {...getInputProps({
              className: 'form-control',
              onChange: (event) => {
                let newValue = event.target.value?.length ? event.target.value : null;
                const parser = step ? parseFloat : parseInt;
                if (newValue) {
                  newValue = parser(newValue);
                }

                return eventDispatch({
                  type: actionTypes.HABITAT,
                  meta: field,
                  payload: newValue,
                });
              },
            })}
          />
          {validationMessage}
        </div>
      )}
    </NumericInputValidator>
  );
};

HabitatNumericInput.propTypes = {
  min: PropTypes.string,
  max: PropTypes.string,
  step: PropTypes.string,
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

const columns = [
  {
    accessorKey: fnMeasurements.TRANSECT_ID,
    filterFn: 'equals',
  },
  {
    header: 'Depth (m)',
    accessorKey: fnMeasurements.DEPTH,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 0,
        max: 1000,
      },
    },
  },
  {
    header: 'Velocity (m/s)',
    accessorKey: fnMeasurements.VELOCITY,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 0,
        max: 10,
      },
    },
  },
  {
    header: 'Substrate',
    accessorKey: fnMeasurements.SUBSTRATE,
    cell: DomainDrivenDropdownCell,
    meta: {
      dropdownProps: {
        fieldName: fnMeasurements.SUBSTRATE,
        featureServiceUrl: config.urls.transectMeasurementsFeatureService,
      },
    },
  },
  {
    header: 'Distance from starting bank (m)',
    accessorKey: fnMeasurements.DISTANCE_START,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 0,
        max: 1000,
      },
    },
  },
];

export function validateTransect(transect, measurements) {
  // validate widths and distances for current transect
  const wettedWidth = transect[config.fieldNames.transect.WWID];
  if (wettedWidth === null) {
    const hasStartDistances = measurements.some((m) => m[fnMeasurements.DISTANCE_START]);

    if (hasStartDistances) {
      return {
        type: 'info',
        message:
          'Wetted Width does not have a value. Remember that the ' +
          'distance from starting bank needs to be less than the wetted width.',
      };
    }
  } else {
    const startsAreValid = measurements
      .filter((m) => m[fnMeasurements.DISTANCE_START] !== null)
      .every((m) => m[fnMeasurements.DISTANCE_START] < wettedWidth);

    if (!startsAreValid) {
      return {
        type: 'danger',
        message: 'All distances from starting bank must be less than the wetted width.',
      };
    }

    if (wettedWidth > transect[config.fieldNames.transect.BWID]) {
      return {
        type: 'danger',
        message: 'Wetted width cannot exceed bankfull width.',
      };
    }
  }

  return true;
}

function Habitat() {
  const {
    eventState: {
      [config.tableNames.habitat]: habitat,
      [config.tableNames.transect]: transects,
      [config.tableNames.transectMeasurements]: measurements,
      other: { totalSediment },
    },
    eventDispatch,
  } = useSamplingEventContext();

  const totalSedimentIsInvalid = ![0, 100].includes(totalSediment);

  function getHabitatInputProps(fieldName) {
    return {
      className: 'form-control',
      onChange: (event) => {
        let newValue = event.target.value?.length ? event.target.value : null;

        return eventDispatch({
          type: actionTypes.HABITAT,
          meta: fieldName,
          payload: newValue,
        });
      },
      value: habitat[fieldName] || '',
      id: `${fieldName}_input`,
    };
  }

  const [currentTransectIndex, setCurrentTransectIndex] = React.useState(1);
  const currentTransectId = transects[currentTransectIndex - 1]?.[config.fieldNames.transect.TRANSECT_ID] ?? 0;

  function getTransectInputProps(fieldName, parser) {
    return {
      className: 'form-control',
      value: transects[currentTransectIndex - 1]?.[fieldName] || '',
      id: `${fieldName}_input_${currentTransectIndex}`,
      onChange: (event) => {
        let newValue = event.target.value?.length ? event.target.value : null;
        if (newValue && parser) {
          newValue = parser(newValue);
        }

        return eventDispatch({
          type: actionTypes.UPDATE_TRANSECT,
          meta: currentTransectIndex,
          payload: {
            [fieldName]: newValue,
          },
        });
      },
    };
  }

  const [selectedMeasurementIndex, setSelectedMeasurementIndex] = React.useState(null);

  const addNewMeasurement = () => {
    eventDispatch({
      type: actionTypes.ADD_MEASUREMENT,
      payload: currentTransectId,
    });
  };

  React.useEffect(() => {
    setSelectedMeasurementIndex(null);
  }, [currentTransectIndex]);

  const [transectValidation, setTransectValidation] = React.useState(true);
  React.useEffect(() => {
    const currentTransect = transects[currentTransectIndex - 1];

    if (currentTransect) {
      const measurementsForThisTransect = measurements.filter(
        (m) => m[fnMeasurements.TRANSECT_ID] === currentTransectId
      );
      setTransectValidation(validateTransect(currentTransect, measurementsForThisTransect));
    } else {
      setTransectValidation(true);
    }
  }, [currentTransectId, currentTransectIndex, measurements, transects]);

  return (
    <div className="habitat">
      <div className="row">
        <div className="col-md-5">
          <h4>Entire Event Reach</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-md-3">
          <HabitatNumericInput
            min="0"
            max="100"
            label="Percentage of Bank Vegetated"
            field={fnHabitat.BANKVEG}
            value={habitat[fnHabitat.BANKVEG]}
          />

          <div className="form-group">
            <label className="control-label">Dominant Overstory</label>
            <DomainDrivenDropdown
              featureServiceUrl={config.urls.habitatFeatureService}
              fieldName={fnHabitat.DOVR}
              {...getHabitatInputProps(fnHabitat.DOVR)}
            />
          </div>

          <div className="form-group">
            <label className="control-label">Dominant Understory</label>
            <DomainDrivenDropdown
              featureServiceUrl={config.urls.habitatFeatureService}
              fieldName={fnHabitat.DUND}
              {...getHabitatInputProps(fnHabitat.DUND)}
            />
          </div>

          <HabitatNumericInput
            label="Large Woody Debris (count)"
            min="0"
            max="1000"
            field={fnHabitat.LGWD}
            value={habitat[fnHabitat.LGWD]}
          />
          <HabitatNumericInput
            label="Percentage of Pool Area"
            min="0"
            max="100"
            field={fnHabitat.POOL}
            value={habitat[fnHabitat.POOL]}
          />
          <HabitatNumericInput
            label="Percentage of Riffle Area"
            min="0"
            max="100"
            field={fnHabitat.RIFF}
            value={habitat[fnHabitat.RIFF]}
          />
          <HabitatNumericInput
            label="Percentage of Run Area"
            min="0"
            max="100"
            field={fnHabitat.RUNA}
            value={habitat[fnHabitat.RUNA]}
          />
        </div>

        <div className="col-md-3">
          <div className="form-group">
            <label className="control-label">Presence of Spring</label>
            <DomainDrivenDropdown
              featureServiceUrl={config.urls.habitatFeatureService}
              fieldName={fnHabitat.SPNG}
              {...getHabitatInputProps(fnHabitat.SPNG)}
            />
          </div>

          <HabitatNumericInput
            label="Backwater Area (m2)"
            min="0"
            field={fnHabitat.BACKWATER}
            value={habitat[fnHabitat.BACKWATER]}
          />
          <HabitatNumericInput
            label="Sinuosity"
            min="1.0"
            max="4.0"
            step="0.1"
            field={fnHabitat.SIN}
            value={habitat[fnHabitat.SIN]}
          />
          <HabitatNumericInput
            label="Percentage of Banks Eroding"
            min="0"
            max="100"
            field={fnHabitat.EROS}
            value={habitat[fnHabitat.EROS]}
          />
        </div>

        <div className="col-md-3">
          <HabitatNumericInput
            label="Water Temperature (C)"
            min="0.00"
            max="100.00"
            step="0.01"
            field={fnHabitat.TEMP}
            value={habitat[fnHabitat.TEMP]}
          />
          <HabitatNumericInput
            label="pH"
            min="0.0"
            max="14.0"
            step="0.1"
            field={fnHabitat.PH}
            value={habitat[fnHabitat.PH]}
          />
          <HabitatNumericInput
            label="Conductivity (μs/cm)"
            min="0"
            max="15000"
            field={fnHabitat.CON}
            value={habitat[fnHabitat.CON]}
          />
          <HabitatNumericInput
            label="Dissolved Oxygen (mg/l)"
            min="0"
            max="1500"
            field={fnHabitat.OXYGEN}
            value={habitat[fnHabitat.OXYGEN]}
          />
          <HabitatNumericInput
            label="Total Dissolved Solids (ppm)"
            min="0"
            max="5000"
            field={fnHabitat.SOLIDS}
            value={habitat[fnHabitat.SOLIDS]}
          />
          <HabitatNumericInput
            label="Turbidity (NTU)"
            min="0"
            max="3000"
            field={fnHabitat.TURBIDITY}
            value={habitat[fnHabitat.TURBIDITY]}
          />
          <HabitatNumericInput
            label="Alkalinity (ppm CaCO3)"
            min="0"
            max="1000"
            field={fnHabitat.ALKALINITY}
            value={habitat[fnHabitat.ALKALINITY]}
          />
        </div>

        <div className="col-md-3">
          <div className={clsx('panel', totalSedimentIsInvalid ? 'panel-danger' : 'panel-default')}>
            <div className="panel-heading">
              <h3 className="panel-title">Sediment Class Percentages</h3>
              <small className="text-muted">Must add up to 100%</small>
            </div>
            <div className="panel-body">
              <HabitatNumericInput
                label="Fines"
                min="0"
                max="100"
                field={fnHabitat.SUB_FINES}
                value={habitat[fnHabitat.SUB_FINES]}
              />
              <HabitatNumericInput
                label="Sand"
                min="0"
                max="100"
                field={fnHabitat.SUB_SAND}
                value={habitat[fnHabitat.SUB_SAND]}
              />
              <HabitatNumericInput
                label="Gravel"
                type="number"
                min="0"
                max="100"
                field={fnHabitat.SUB_GRAV}
                value={habitat[fnHabitat.SUB_GRAV]}
              />
              <HabitatNumericInput
                label="Cobble"
                min="0"
                max="100"
                field={fnHabitat.SUB_COBB}
                value={habitat[fnHabitat.SUB_COBB]}
              />
              <HabitatNumericInput
                label="Rubble"
                min="0"
                max="100"
                field={fnHabitat.SUB_RUBB}
                value={habitat[fnHabitat.SUB_RUBB]}
              />
              <HabitatNumericInput
                label="Boulder"
                min="0"
                max="100"
                field={fnHabitat.SUB_BOUL}
                value={habitat[fnHabitat.SUB_BOUL]}
              />
              <HabitatNumericInput
                label="Bedrock"
                min="0"
                max="100"
                field={fnHabitat.SUB_BEDR}
                value={habitat[fnHabitat.SUB_BEDR]}
              />

              <div
                className={clsx(
                  'pull-right',
                  totalSedimentIsInvalid && 'text-danger',
                  totalSediment === 100 && 'text-success'
                )}
              >
                <strong>Total</strong>
                <span className="badge">{totalSediment}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-5">
          <h4>Transects</h4>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <GridTab
            name=""
            numTabs={transects.length}
            addTab={() => eventDispatch({ type: actionTypes.ADD_TRANSECT })}
            currentTab={currentTransectIndex}
            setCurrentTab={setCurrentTransectIndex}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-md-3">
          <NumericInputValidator>
            {(getInputProps, getGroupClassName, validationMessage) => (
              <div className={getGroupClassName('form-group')}>
                <label>Bankfull Width (m)</label>
                <input
                  step="0.01"
                  min="0"
                  max="1000"
                  {...getInputProps(getTransectInputProps(config.fieldNames.transect.BWID, parseFloat))}
                />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>
        </div>

        <div className="col-md-3">
          <NumericInputValidator>
            {(getInputProps, getGroupClassName, validationMessage) => (
              <div className={getGroupClassName('form-group')}>
                <label>Wetted Width (m)</label>
                <input
                  step="0.01"
                  min="0"
                  max="1000"
                  {...getInputProps(getTransectInputProps(config.fieldNames.transect.WWID, parseFloat))}
                />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>
        </div>

        <div className="col-md-3">
          <div className="form-group">
            <label className="control-label">Starting bank</label>
            <DomainDrivenDropdown
              featureServiceUrl={config.urls.transectFeatureService}
              fieldName={config.fieldNames.transect.STARTING_BANK}
              {...getTransectInputProps(config.fieldNames.transect.STARTING_BANK)}
            />
          </div>
        </div>

        <div className="col-md-3" style={{ marginTop: '25px' }}>
          <DataGridAddDeleteButtons
            deleteCurrent={() => {
              eventDispatch({
                type: actionTypes.UPDATE_MEASUREMENTS,
                payload: measurements.filter((_, i) => i !== selectedMeasurementIndex),
              });
            }}
            addNew={addNewMeasurement}
            deleteDisabled={selectedMeasurementIndex === null}
          />
        </div>
      </div>

      {transectValidation.message ? (
        <div className={`alert alert-${transectValidation.type}`}>{transectValidation.message}</div>
      ) : null}

      <div className="row">
        <div className="col-md-12">
          <DataGrid
            data={measurements}
            onChangeAll={(newData) => eventDispatch({ type: actionTypes.UPDATE_MEASUREMENTS, payload: newData })}
            columns={columns}
            hiddenColumns={[fnMeasurements.TRANSECT_ID]}
            filter={{
              field: fnMeasurements.TRANSECT_ID,
              value: currentTransectId,
            }}
            selectedRow={selectedMeasurementIndex}
            setSelectedRow={setSelectedMeasurementIndex}
            addNewRow={addNewMeasurement}
          />
        </div>
      </div>
    </div>
  );
}

export default Habitat;
