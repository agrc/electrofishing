import React from 'react';
import eventData from '../../tests/data/NewCollectionEventData.json';
import SummaryReport from './SummaryReport.jsx';

const story = {
  title: 'SummaryReport',
  component: SummaryReport,
};

export default story;

export const Default = () => {
  const [show, setShow] = React.useState(true);

  return <SummaryReport show={show} setShow={setShow} eventData={eventData} onConfirm={console.log} />;
};
