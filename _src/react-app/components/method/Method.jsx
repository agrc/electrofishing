import React, { useContext } from 'react';
import config from '../../config';
import { EventContext, actionTypes } from '../NewCollectionEvent';
import Equipment from './Equipment';

function Method() {
  const { eventState, eventDispatch } = useContext(EventContext);

  const onEquipmentChange = (newEquipment) => {
    eventDispatch({
      type: actionTypes.EQUIPMENT,
      payload: newEquipment,
      meta: newEquipment.equipment[config.fieldNames.equipment.EQUIPMENT_ID],
    });
  };

  const addNewEquipment = () => {
    eventDispatch({
      type: actionTypes.ADD_EQUIPMENT,
    });
  };

  const removeEquipment = (equipmentId) => {
    eventDispatch({
      type: actionTypes.REMOVE_EQUIPMENT,
      meta: equipmentId,
    });
  };

  return (
    <div>
      <h4>Equipment</h4>
      {eventState[config.tableNames.equipment].map((equipment, index) => {
        const id = equipment[config.fieldNames.equipment.EQUIPMENT_ID];
        const anodes = eventState[config.tableNames.anodes].filter(
          (anode) => anode[config.fieldNames.anodes.EQUIPMENT_ID] === id
        );

        return (
          <Equipment
            key={id}
            state={{ equipment, anodes }}
            onChange={onEquipmentChange}
            addNew={addNewEquipment}
            remove={() => removeEquipment(id)}
            isLast={index === eventState[config.tableNames.equipment].length - 1}
            isFirst={index === 0}
          />
        );
      })}
    </div>
  );
}

export default Method;
