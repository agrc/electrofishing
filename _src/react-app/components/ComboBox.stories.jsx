import * as React from 'react';
import ComboBox from './ComboBox';

const story = {
  title: 'ComboBox',
  component: ComboBox,
};
export default story;

const items = [
  {
    value: 1,
    label: 'one',
  },
  {
    value: 2,
    label: 'two',
  },
  {
    value: 3,
    label: 'three',
  },
];
const existingValueItems = [{ value: 'hello-value', label: 'Hello Value' }];

export const Default = () => {
  const [emptyValue, setEmptyValue] = React.useState('');
  const [existingValue, setExistingValue] = React.useState('hello-value');
  const [itemsValue, setItemsValue] = React.useState(null);

  return (
    <>
      empty: {emptyValue}
      <ComboBox items={[]} onChange={setEmptyValue} value={emptyValue} />
      existing value: {existingValue}
      <ComboBox items={existingValueItems} onChange={setExistingValue} value={existingValue} />
      items: {itemsValue}
      <ComboBox items={items} onChange={setItemsValue} value={itemsValue} />
    </>
  );
};
