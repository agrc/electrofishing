import React from 'react';
import SummaryReport from './SummaryReport';
import eventData from '../../../tests/data/NewCollectionEventData.json';

const story = {
  title: 'SummaryReport',
  component: SummaryReport,
};

export default story;

export const Default = () => {
  const [show, setShow] = React.useState(true);

  return <SummaryReport show={show} setShow={setShow} eventData={eventData} onConfirm={console.log} />;
};
