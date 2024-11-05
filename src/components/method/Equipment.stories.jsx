import { useState } from 'react';
import config from '../../config';
import getGUID from '../../helpers/getGUID';
import Equipment from './Equipment.jsx';

const story = {
  title: 'Equipment',
  component: Equipment,
};

export default story;

const fieldNames = config.fieldNames.equipment;

export const Default = () => {
  const [state, setState] = useState({
    equipment: {
      [fieldNames.EVENT_ID]: getGUID(),
      [fieldNames.TYPE]: 'Backpack/Canoe',
      [fieldNames.EQUIPMENT_ID]: getGUID(),
      [fieldNames.MODEL]: null,
      [fieldNames.ARRAY_TYPE]: null,
      [fieldNames.NUM_NETTERS]: null,
      [fieldNames.CATHODE_TYPE]: null,
      [fieldNames.NUM_ANODES]: null,
      [fieldNames.CATHODE_LEN]: null,
      [fieldNames.CATHODE_DIAMETER]: null,
      [fieldNames.MACHINE_RES]: null,
      [fieldNames.WAVEFORM]: null,
      [fieldNames.VOLTAGE]: null,
      [fieldNames.DUTY_CYCLE]: null,
      [fieldNames.FREQUENCY]: null,
      [fieldNames.AMPS]: null,
      [fieldNames.DURATION]: null,
    },
    anodes: [],
  });

  return (
    <>
      <Equipment
        state={state}
        onChange={setState}
        remove={() => console.log('removed')}
        addNew={() => console.log('added')}
        isLastOne
      />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
};
