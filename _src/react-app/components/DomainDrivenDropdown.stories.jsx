import React, { useState } from 'react';
import DomainDrivenDropdown from './DomainDrivenDropdown';

const story = {
  title: 'DomainDrivenDropdown',
  component: DomainDrivenDropdown,
};

export default story;

export const Default = () => {
  const [value, setValue] = useState('');

  const onChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <DomainDrivenDropdown
      featureServiceUrl="https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahRoads/FeatureServer/0"
      fieldName="CARTOCODE"
      value={value}
      onChange={onChange}
      id="test"
    />
  );
};
