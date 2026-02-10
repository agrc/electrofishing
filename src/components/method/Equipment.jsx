import PropTypes from 'prop-types';
import { useEffect, useId, useRef } from 'react';
import { clsx } from 'clsx';
import config from '../../config';
import AddRemoveButtons from '../AddRemoveButtons.jsx';
import DataGrid, { DomainDrivenDropdownCell, NumericInputCell } from '../DataGrid.jsx';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import NumericInputValidator from '../NumericInputValidator.jsx';

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
  const tabsRef = useRef(null);
  const id = useId();

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

  const onEquipmentChangeRef = useRef(onEquipmentChange);
  useEffect(() => {
    onEquipmentChangeRef.current = onEquipmentChange;
  });

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    const onTabShown = (e) => {
      const targetId = e.target.getAttribute('data-equipment-type');
      if (targetId) {
        onEquipmentChangeRef.current(fieldNamesEQ.TYPE, targetId);
      }
    };

    // Attach to the nav container, events bubble
    el.addEventListener('shown.bs.tab', onTabShown);

    return () => {
      el.removeEventListener('shown.bs.tab', onTabShown);
    };
  }, []);

  const getEquipmentInputProps = (fieldName, parser, idSuffix = '') => {
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
      id: `${fieldName}_input${idSuffix}`,
    };
  };

  const renderFields = (type) => {
    const isRaft = type === EQUIPMENT_TYPES.RAFTBOAT;
    const isBackpack = type === EQUIPMENT_TYPES.BACKPACK;
    const suffix = `_${type.replace(/[^a-zA-Z]/g, '')}`;
    const gp = (name, parser) => getEquipmentInputProps(name, parser, suffix);

    return (
      <>
        <div className="row">
          <div className="mb-3 col-md-3">
            <label htmlFor={`${fieldNamesEQ.MODEL}_input${suffix}`}>Model</label>
            <DomainDrivenDropdown
              featureServiceUrl={equipmentServiceUrl}
              fieldName={fieldNamesEQ.MODEL}
              {...gp(fieldNamesEQ.MODEL)}
            />
          </div>

          {isRaft ? (
            <div className="mb-3 col-md-3">
              <label htmlFor={`${fieldNamesEQ.ARRAY_TYPE}_input${suffix}`}>Array Type</label>
              <DomainDrivenDropdown
                featureServiceUrl={equipmentServiceUrl}
                fieldName={fieldNamesEQ.ARRAY_TYPE}
                {...gp(fieldNamesEQ.ARRAY_TYPE)}
              />
            </div>
          ) : null}

          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-3">
                <label htmlFor={`${fieldNamesEQ.NUM_NETTERS}_input${suffix}`}># Netters</label>
                <input min="1" max="30" {...getInputProps(gp(fieldNamesEQ.NUM_NETTERS, parseInt))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>

          {!isBackpack ? (
            <div className="mb-3 col-md-3">
              <label htmlFor={`${fieldNamesEQ.CATHODE_TYPE}_input${suffix}`}>Cathode Type</label>
              <DomainDrivenDropdown
                featureServiceUrl={equipmentServiceUrl}
                fieldName={fieldNamesEQ.CATHODE_TYPE}
                {...gp(fieldNamesEQ.CATHODE_TYPE)}
              />
            </div>
          ) : null}
        </div>

        <div className="row">
          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.NUM_ANODES}_input${suffix}`}># Anodes</label>
                <input value="1" min="1" max="5" {...getInputProps(gp(fieldNamesEQ.NUM_ANODES, parseInt))} />
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
              idPrefix={suffix}
            />
          </div>
        </div>

        <div className="row">
          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.CATHODE_LEN}_input${suffix}`}>Cathode Length (centimeters)</label>
                <input min="1" max="305" step="0.01" {...getInputProps(gp(fieldNamesEQ.CATHODE_LEN, parseFloat))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>

          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.CATHODE_DIAMETER}_input${suffix}`}>
                  Cathode Diameter (centimeters)
                </label>
                <input
                  min="0.1"
                  max="2.54"
                  step="0.01"
                  disabled={state.equipment[fieldNamesEQ.CATHODE_TYPE] === CATHODE_TYPES.BOAT}
                  {...getInputProps(gp(fieldNamesEQ.CATHODE_DIAMETER, parseFloat))}
                />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>

          <div className="mb-3 col-md-4">
            <label htmlFor={`${fieldNamesEQ.MACHINE_RES}_input${suffix}`}>Machine Resistance (ohms)</label>
            <input type="number" {...gp(fieldNamesEQ.MACHINE_RES, parseFloat)} />
          </div>
        </div>

        <div className="row">
          <div className="mb-3 col-md-4">
            <label htmlFor={`${fieldNamesEQ.WAVEFORM}_input${suffix}`}>Waveform</label>
            <DomainDrivenDropdown
              featureServiceUrl={equipmentServiceUrl}
              fieldName={fieldNamesEQ.WAVEFORM}
              {...gp(fieldNamesEQ.WAVEFORM)}
            />
          </div>

          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.VOLTAGE}_input${suffix}`}>Voltage (volts)</label>
                <input min="0" max="1000" step="0.01" {...getInputProps(gp(fieldNamesEQ.VOLTAGE, parseFloat))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>

          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.DUTY_CYCLE}_input${suffix}`}>Duty Cycle (%)</label>
                <input min="0" max="100" {...getInputProps(gp(fieldNamesEQ.DUTY_CYCLE, parseInt))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>
        </div>

        <div className="row">
          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.FREQUENCY}_input${suffix}`}>Frequency (hertz)</label>
                <input min="1" max="1000" {...getInputProps(gp(fieldNamesEQ.FREQUENCY, parseInt))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>

          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.AMPS}_input${suffix}`}>Amps</label>
                <input min="0" max="150" step="0.1" {...getInputProps(gp(fieldNamesEQ.AMPS, parseFloat))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>

          <NumericInputValidator>
            {(getInputProps, validationMessage) => (
              <div className="mb-3 col-md-4">
                <label htmlFor={`${fieldNamesEQ.DURATION}_input${suffix}`}>Duration/Pedal Time (seconds)</label>
                <input min="1" max="7200" {...getInputProps(gp(fieldNamesEQ.DURATION, parseInt))} />
                {validationMessage}
              </div>
            )}
          </NumericInputValidator>
        </div>
      </>
    );
  };

  return (
    <div className="equipment">
      <ul className="nav nav-pills" ref={tabsRef}>
        <li className="nav-item">
          <a
            className={'nav-link active'}
            href={`#backpack${id}`}
            data-bs-toggle="tab"
            data-equipment-type={EQUIPMENT_TYPES.BACKPACK}
          >
            Backpack
          </a>
        </li>
        <li className="nav-item">
          <a
            className={'nav-link'}
            href={`#canoe${id}`}
            data-bs-toggle="tab"
            data-equipment-type={EQUIPMENT_TYPES.CANOEBARGE}
          >
            Canoe/Barge
          </a>
        </li>
        <li className="nav-item">
          <a
            className={'nav-link'}
            href={`#raft${id}`}
            data-bs-toggle="tab"
            data-equipment-type={EQUIPMENT_TYPES.RAFTBOAT}
          >
            Raft/Boat
          </a>
        </li>
      </ul>

      <div className="tab-content">
        <div className={'tab-pane fade show active'} id={`backpack${id}`}>
          {renderFields(EQUIPMENT_TYPES.BACKPACK)}
        </div>
        <div className={'tab-pane fade'} id={`canoe${id}`}>
          {renderFields(EQUIPMENT_TYPES.CANOEBARGE)}
        </div>
        <div className={'tab-pane fade'} id={`raft${id}`}>
          {renderFields(EQUIPMENT_TYPES.RAFTBOAT)}
        </div>
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
