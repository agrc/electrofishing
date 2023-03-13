import React from 'react';
import GridTab from './GridTab.jsx';

const story = {
  title: 'GridTab',
  component: GridTab,
};

export default story;

export const Default = () => {
  const [numPasses, setNumPasses] = React.useState(1);
  const [currentTab, setCurrentTab] = React.useState(1);

  return (
    <>
      <GridTab
        name="GridTabTest"
        numPasses={numPasses}
        setNumPasses={setNumPasses}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
      <p>
        <b>numPasses: </b>
        <pre>{numPasses}</pre>
        <b>currentTab: </b>
        <pre>{currentTab}</pre>
      </p>
    </>
  );
};
