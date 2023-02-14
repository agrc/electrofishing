import React from 'react';
import DataGrid, { DomainDrivenDropdownCell, NumericInputCell } from './DataGrid';

const story = {
  title: 'DataGrid',
  component: DataGrid,
};

export default story;

export const Default = () => {
  const columns = [
    {
      header: 'Should be hidden',
      accessorKey: 'HIDDEN',
    },
    {
      header: 'Anode Diameter (cm)',
      accessorKey: 'DIAMETER',
      cell: NumericInputCell,
      meta: {
        inputProps: {
          min: 1,
          max: 750,
        },
      },
    },
    {
      header: 'Another Numeric',
      accessorKey: 'NUMBER',
      cell: NumericInputCell,
      meta: {
        inputProps: {
          min: 1,
          max: 750,
        },
      },
    },
    {
      header: 'Anode Shape',
      accessorKey: 'SHAPE',
      cell: DomainDrivenDropdownCell,
      meta: {
        dropdownProps: {
          featureServiceUrl:
            'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahRoads/FeatureServer/0',
          fieldName: 'CARTOCODE',
        },
      },
    },
  ];

  const [state, setState] = React.useState([
    {
      HIDDEN: '1',
      DIAMETER: 1,
      NUMBER: 4,
      SHAPE: '13',
    },
  ]);

  const addNewRow = () => {
    setState((old) => [...old, { HIDDEN: '2', DIAMETER: null, NUMBER: null, SHAPE: null }]);
  };

  return (
    <>
      <DataGrid data={state} onChange={setState} columns={columns} hiddenColumns={['HIDDEN']} addNewRow={addNewRow} />
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </>
  );
};
