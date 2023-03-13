import React, { useState, useEffect, forwardRef } from 'react';
import { useReactTable, getCoreRowModel, flexRender, getFilteredRowModel } from '@tanstack/react-table';
import NumericInputValidator from './NumericInputValidator.jsx';
import DomainDrivenDropdown from './DomainDrivenDropdown.jsx';
import PropTypes from 'prop-types';
import clsx from 'clsx';

function DataGrid({
  data,
  onChangeAll, // called with all data
  onChangeItem, // called only with rowIndex, columnId, and new value
  columns,
  hiddenColumns,
  addNewRow,
  filter,
  selectedRow,
  setSelectedRow,
  highlight,
  boldRows,
}) {
  // inspiration from: https://codesandbox.io/s/github/tanstack/table/tree/main/examples/react/editable-data?from-embed=&file=/src/main.tsx
  const initialState = {};

  if (hiddenColumns && hiddenColumns.length > 0) {
    initialState.columnVisibility = Object.fromEntries(hiddenColumns.map((c) => [c, false]));
  }

  const updateCell = (rowIndex, columnId, value) => {
    if (onChangeItem) {
      onChangeItem(rowIndex, columnId, value);
    }

    if (onChangeAll) {
      onChangeAll(
        data.map((row, index) => {
          if (index === rowIndex) {
            return {
              ...data[rowIndex],
              [columnId]: value,
            };
          }

          return row;
        })
      );
    }
  };

  const tableOptions = {
    columns,
    data: data,
    enableColumnFilters: true,
    enableFilters: true,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState,
    meta: {
      updateCell,
    },
  };

  if (setSelectedRow) {
    tableOptions.onRowSelectionChange = (getNewSelection) => {
      const newSelection = getNewSelection();
      if (newSelection) {
        setSelectedRow(parseInt(Object.keys(newSelection)[0]));
      } else {
        setSelectedRow(null);
      }
    };
    tableOptions.state = {
      rowSelection: selectedRow !== null ? { [selectedRow]: true } : {},
    };
  }
  const table = useReactTable(tableOptions);

  React.useEffect(() => {
    if (filter) {
      table.getColumn(filter.field).setFilterValue(filter.value);
    }
  }, [filter, table]);

  const rowModel = table.getRowModel();
  const selectRow = (row) => {
    if (!row.getIsSelected()) {
      row.toggleSelected(true);
    }
  };

  return (
    <table className="table table-bordered table-condensed data-grid table-striped">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {rowModel.rows.map((row) => (
          <tr
            key={row.id}
            className={clsx(row.getIsSelected() && 'info', boldRows && boldRows.includes(row.index) && 'bold')}
            onFocus={() => selectRow(row)}
            onClick={() => selectRow(row)}
          >
            {row.getVisibleCells().map((cell) => {
              const isLastRow = row.index === rowModel.rows[rowModel.rows.length - 1].index;

              const additionalProps = {};
              if (isLastRow && addNewRow) {
                const visibleCells = row.getVisibleCells();
                const isLastCell = cell.column.id === visibleCells[visibleCells.length - 1].column.id;

                if (isLastCell) {
                  additionalProps.onKeyDown = (event) => {
                    if (event.key === 'Tab' && !event.shiftKey) {
                      addNewRow();
                    }
                  };
                }
              }

              return (
                <td key={cell.id} className={highlight && highlight(row.original, cell.column.id) ? 'warning' : null}>
                  {flexRender(cell.column.columnDef.cell, { ...cell.getContext(), ...additionalProps })}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

DataGrid.propTypes = {
  data: PropTypes.array.isRequired,
  onChangeItem: PropTypes.func,
  onChangeAll: PropTypes.func,
  columns: PropTypes.array.isRequired,
  hiddenColumns: PropTypes.array.isRequired,
  addNewRow: PropTypes.func,
  filter: PropTypes.shape({
    field: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }),
  highlight: PropTypes.func,
  selectedRow: PropTypes.number,
  setSelectedRow: PropTypes.func,
  boldRows: PropTypes.array,
};

export default DataGrid;

export const NumericInputCell = forwardRef(function NumericInputCell(
  { getValue, row: { index }, column, table, onKeyDown },
  ref
) {
  const initialValue = getValue();
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    table.options.meta?.updateCell(index, column.id, value);
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <NumericInputValidator>
      {(getInputProps, getGroupClassName, validationMessage) => (
        <div className={getGroupClassName()}>
          <input
            id={`numeric-input-cell-${index}-${column.id}`}
            value={value || ''}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            ref={ref}
            {...getInputProps({
              onChange: (e) => setValue(e.target.valueAsNumber || null),
              ...column.columnDef.meta?.inputProps,
            })}
          />
          {validationMessage}
        </div>
      )}
    </NumericInputValidator>
  );
});

NumericInputCell.propTypes = {
  getValue: PropTypes.func.isRequired,
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }).isRequired,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    columnDef: PropTypes.shape({
      meta: PropTypes.shape({
        inputProps: PropTypes.object,
      }),
    }),
  }).isRequired,
  table: PropTypes.shape({
    options: PropTypes.shape({
      meta: PropTypes.shape({
        updateCell: PropTypes.func.isRequired,
      }),
    }),
  }).isRequired,
  onKeyDown: PropTypes.func,
};

export const DomainDrivenDropdownCell = forwardRef(function DomainDrivenDropdownCell(
  { getValue, row: { index }, column, table, onKeyDown },
  ref
) {
  const value = getValue();

  const onChange = (event) => {
    table.options.meta?.updateCell(index, column.id, event.target.value);
  };

  return (
    <DomainDrivenDropdown
      {...column.columnDef.meta?.dropdownProps}
      value={value}
      onChange={onChange}
      minimal
      onKeyDown={onKeyDown}
      ref={ref}
      id={`dropdown-${index}-${column.id}`}
    />
  );
});

DomainDrivenDropdownCell.propTypes = {
  getValue: PropTypes.func.isRequired,
  row: PropTypes.shape({
    index: PropTypes.number.isRequired,
  }).isRequired,
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    columnDef: PropTypes.shape({
      meta: PropTypes.shape({
        dropdownProps: PropTypes.object,
      }),
    }),
  }).isRequired,
  table: PropTypes.shape({
    options: PropTypes.shape({
      meta: PropTypes.shape({
        updateCell: PropTypes.func.isRequired,
      }),
    }),
  }).isRequired,
  onKeyDown: PropTypes.func,
};
