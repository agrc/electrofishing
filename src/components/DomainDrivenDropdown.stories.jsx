import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DomainDrivenDropdown from './DomainDrivenDropdown.jsx';

const queryClient = new QueryClient();

const story = {
  title: 'DomainDrivenDropdown',
  component: DomainDrivenDropdown,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
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
