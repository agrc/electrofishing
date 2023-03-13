import { useState } from 'react';
import OtherOptionHandler from './OtherOptionHandler.jsx';

const story = {
  title: 'OtherOptionHandler',
  component: OtherOptionHandler,
};

export default story;

const existing = ['one', 'two', 'three'];
const otherTxt = '[other]';

export const Default = () => {
  const [show, setShow] = useState(true);

  return (
    <OtherOptionHandler
      show={show}
      setShow={setShow}
      existingOptions={existing}
      otherTxt={otherTxt}
      onOtherOptionAdded={console.log}
    />
  );
};
