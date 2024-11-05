import PropTypes from 'prop-types';
import config from '../../config';
import AddRemoveButtons from '../AddRemoveButtons.jsx';
import DataGrid, { DomainDrivenDropdownCell, NumericInputCell } from '../DataGrid.jsx';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import NumericInputValidator from '../NumericInputValidator.jsx';

const ACTIVE = 'active';
export const EQUIPMENT_TYPES = {
  BACKPACK: 'Backpack',
  CANOEBARGE: 'Canoe/Barge',
  RAFTBOAT: 'Raft/Boat',
};
export const CATHODE_TYPES = {
  BOAT: 'Boat',
  NON_BOAT: 'Non-Boat',
};
const fieldNamesEQ = config.fieldNames.equipment;
const fieldNamesAN = config.fieldNames.anodes;
const equipmentServiceUrl = config.urls.equipmentFeatureService;
const columns = [
  {
    header: fieldNamesAN.EQUIPMENT_ID,
    accessorKey: fieldNamesAN.EQUIPMENT_ID,
  },
  {
    header: 'Anode Diameter (cm)',
    accessorKey: fieldNamesAN.ANODE_DIAMETER,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 1,
        max: 750,
      },
    },
  },
  {
    header: 'Stock Diameter (cm)',
    accessorKey: fieldNamesAN.STOCK_DIAMETER,
    cell: NumericInputCell,
    meta: {
      inputProps: {
        min: 0.1,
        max: 2.54,
        step: 0.01,
      },
    },
  },
  {
    header: 'Anode Shape',
    accessorKey: fieldNamesAN.ANODE_SHAPE,
    cell: DomainDrivenDropdownCell,
    meta: {
      dropdownProps: {
        fieldName: fieldNamesAN.ANODE_SHAPE,
        featureServiceUrl: config.urls.anodesFeatureService,
      },
    },
  },
];

export const getSideEffects = (fieldName, newValue) => {
  const extra = {};
  // clear cathode diameter if cathode type is boat
  if (fieldName === fieldNamesEQ.CATHODE_TYPE && newValue === CATHODE_TYPES.BOAT) {
    extra[fieldNamesEQ.CATHODE_DIAMETER] = null;
  }

  // clear fields that are hidden when changing equipment type
  if (fieldName === fieldNamesEQ.TYPE) {
    if (newValue === EQUIPMENT_TYPES.BACKPACK || newValue === EQUIPMENT_TYPES.CANOEBARGE) {
      extra[fieldNamesEQ.ARRAY_TYPE] = null;
    }

    if (newValue === EQUIPMENT_TYPES.BACKPACK) {
      extra[fieldNamesEQ.CATHODE_TYPE] = null;
    }
  }

  return extra;
};

function Equipment({ state, onChange, addNew, remove, isLast, isFirst }) {
  function getNewAnodeRow() {
    return Object.fromEntries(
      columns.map((c) => {
        const value = c.accessorKey === fieldNamesAN.EQUIPMENT_ID ? state.equipment[fieldNamesEQ.EQUIPMENT_ID] : null;

        return [c.accessorKey, value];
      }),
    );
  }

  const onEquipmentChange = (fieldName, newValue) => {
    let anodes = state.anodes;
    if (fieldName === fieldNamesEQ.NUM_ANODES && state.equipment[fieldNamesEQ.NUM_ANODES] !== newValue) {
      anodes = Array.from({ length: newValue }, getNewAnodeRow);
    }

    onChange({
      equipment: {
        ...state.equipment,
        ...getSideEffects(fieldName, newValue),
        [fieldName]: newValue,
      },
      anodes,
    });
  };

  const onAnodeGridChange = (newAnodes) => {
    onChange({
      ...state,
      anodes: newAnodes,
    });
  };

  const getEquipmentInputProps = (fieldName, parser) => {
    return {
      className: 'form-control',
      onChange: (event) => {
        let newValue = event.target.value?.length ? event.target.value : null;
        if (newValue && parser) {
          newValue = parser(newValue);
        }

        return onEquipmentChange(fieldName, newValue);
      },
      value: state.equipment[fieldName] || '',
      id: `${fieldName}_input`,
    };
  };

  return (
    <div className="equipment">
      <ul className="nav nav-pills">
        <li
          className={state.equipment[fieldNamesEQ.TYPE] === EQUIPMENT_TYPES.BACKPACK ? ACTIVE : null}
          onClick={() => onEquipmentChange(fieldNamesEQ.TYPE, EQUIPMENT_TYPES.BACKPACK)}
        >
          <a href="#" data-toggle="tab">
            Backpack
          </a>
        </li>
        <li
          className={state.equipment[fieldNamesEQ.TYPE] === EQUIPMENT_TYPES.CANOEBARGE ? ACTIVE : null}
          onClick={() => onEquipmentChange(fieldNamesEQ.TYPE, EQUIPMENT_TYPES.CANOEBARGE)}
        >
          <a href="#" data-toggle="tab">
            Canoe/Barge
          </a>
        </li>
        <li
          className={state.equipment[fieldNamesEQ.TYPE] === EQUIPMENT_TYPES.RAFTBOAT ? ACTIVE : null}
          onClick={() => onEquipmentChange(fieldNamesEQ.TYPE, EQUIPMENT_TYPES.RAFTBOAT)}
        >
          <a href="#" data-toggle="tab">
            Raft/Boat
          </a>
        </li>
      </ul>

      <div className="row">
        <div className="form-group col-md-3">
          <label>Model</label>
          <DomainDrivenDropdown
            featureServiceUrl={equipmentServiceUrl}
            fieldName={fieldNamesEQ.MODEL}
            {...getEquipmentInputProps(fieldNamesEQ.MODEL)}
          />
        </div>

        {state.equipment[fieldNamesEQ.TYPE] === EQUIPMENT_TYPES.RAFTBOAT ? (
          <div className="form-group col-md-3">
            <label>Array Type</label>
            <DomainDrivenDropdown
              featureServiceUrl={equipmentServiceUrl}
              fieldName={fieldNamesEQ.ARRAY_TYPE}
              {...getEquipmentInputProps(fieldNamesEQ.ARRAY_TYPE)}
            />
          </div>
        ) : null}

        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-3')}>
              <label># Netters</label>
              <input min="1" max="20" {...getInputProps(getEquipmentInputProps(fieldNamesEQ.NUM_NETTERS, parseInt))} />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        {state.equipment[fieldNamesEQ.TYPE] !== EQUIPMENT_TYPES.BACKPACK ? (
          <div className="form-group col-md-3">
            <label>Cathode Type</label>
            <DomainDrivenDropdown
              featureServiceUrl={equipmentServiceUrl}
              fieldName={fieldNamesEQ.CATHODE_TYPE}
              {...getEquipmentInputProps(fieldNamesEQ.CATHODE_TYPE)}
            />
          </div>
        ) : null}
      </div>

      <div className="row">
        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label"># Anodes</label>
              <input
                value="1"
                min="1"
                max="5"
                {...getInputProps(getEquipmentInputProps(fieldNamesEQ.NUM_ANODES, parseInt))}
              />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <div className="col-md-8">
          <DataGrid
            data={state.anodes}
            onChangeAll={onAnodeGridChange}
            columns={columns}
            hiddenColumns={[fieldNamesAN.EQUIPMENT_ID]}
          />
        </div>
      </div>

      <div className="row">
        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Cathode Length (centimeters)</label>
              <input
                min="1"
                max="305"
                step="0.01"
                {...getInputProps(getEquipmentInputProps(fieldNamesEQ.CATHODE_LEN, parseFloat))}
              />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Cathode Diameter (centimeters)</label>
              <input
                min="0.1"
                max="2.54"
                step="0.01"
                disabled={state.equipment[fieldNamesEQ.CATHODE_TYPE] === CATHODE_TYPES.BOAT}
                {...getInputProps(getEquipmentInputProps(fieldNamesEQ.CATHODE_DIAMETER, parseFloat))}
              />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <div className="form-group col-md-4">
          <label className="control-label">Machine Resistance (ohms)</label>
          <input type="number" {...getEquipmentInputProps(fieldNamesEQ.MACHINE_RES, parseFloat)} />
        </div>
      </div>

      <div className="row">
        <div className="form-group col-md-4">
          <label className="control-label">Waveform</label>
          <DomainDrivenDropdown
            featureServiceUrl={equipmentServiceUrl}
            fieldName={fieldNamesEQ.WAVEFORM}
            {...getEquipmentInputProps(fieldNamesEQ.WAVEFORM)}
          />
        </div>

        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Voltage (volts)</label>
              <input
                min="0"
                max="1000"
                step="0.01"
                {...getInputProps(getEquipmentInputProps(fieldNamesEQ.VOLTAGE, parseFloat))}
              />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Duty Cycle (%)</label>
              <input min="0" max="100" {...getInputProps(getEquipmentInputProps(fieldNamesEQ.DUTY_CYCLE, parseInt))} />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>
      </div>

      <div className="row">
        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Frequency (hertz)</label>
              <input min="1" max="1000" {...getInputProps(getEquipmentInputProps(fieldNamesEQ.FREQUENCY, parseInt))} />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Amps</label>
              <input
                min="0"
                max="150"
                step="0.1"
                {...getInputProps(getEquipmentInputProps(fieldNamesEQ.AMPS, parseFloat))}
              />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('form-group col-md-4')}>
              <label className="control-label">Duration/Pedal Time (seconds)</label>
              <input min="1" max="7200" {...getInputProps(getEquipmentInputProps(fieldNamesEQ.DURATION, parseInt))} />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>
      </div>
      <AddRemoveButtons addNew={addNew} remove={remove} isLast={isLast} isFirst={isFirst} />
    </div>
  );
}

Equipment.propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  addNew: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  isLast: PropTypes.bool.isRequired,
  isFirst: PropTypes.bool.isRequired,
};

export default Equipment;
