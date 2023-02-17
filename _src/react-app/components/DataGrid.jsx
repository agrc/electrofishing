import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import NumericInputValidator from './NumericInputValidator';
import DomainDrivenDropdown from './DomainDrivenDropdown';
import usePrevious from '../hooks/usePrevious';

export default function DataGrid({ data, onChange, columns, hiddenColumns, addNewRow }) {
  // inspiration from: https://codesandbox.io/s/github/tanstack/table/tree/main/examples/react/editable-data?from-embed=&file=/src/main.tsx
  const initialState = {};

  if (hiddenColumns && hiddenColumns.length > 0) {
    initialState.columnVisibility = Object.fromEntries(hiddenColumns.map((c) => [c, false]));
  }

  const updateCell = (rowIndex, columnId, value) => {
    onChange(
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
  };

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    initialState,
    meta: {
      updateCell,
    },
  });

  const rowModel = table.getRowModel();

  // auto focus first cell when new row is added
  const firstCellLastRowRef = useRef();
  const previousData = usePrevious(data);
  useEffect(() => {
    if (data.length - previousData?.length === 1) {
      firstCellLastRowRef?.current?.focus();
    }
  }, [data, previousData, rowModel.rows]);

  return (
    <table className="table table-bordered table-condensed data-grid">
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
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const visibleCells = row.getVisibleCells();
              const isLastRow = row.index === rowModel.rows.length - 1;
              const isLastCell = cell.column.id === visibleCells[visibleCells.length - 1].column.id;
              const isFirstCell = cell.column.id === visibleCells[0].column.id;
              const isLastCellInLastRow = isLastRow && isLastCell;
              const isFirstCellInLastRow = isLastRow && isFirstCell;

              const additionalProps = {};

              if (isLastCellInLastRow && addNewRow) {
                additionalProps.onKeyDown = (event) => {
                  if (event.key === 'Tab' && !event.shiftKey) {
                    event.preventDefault();
                    addNewRow();
                  }
                };
              }

              if (isFirstCellInLastRow && addNewRow) {
                additionalProps.ref = firstCellLastRowRef;
              }

              return (
                <td key={cell.id}>
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
            value={value || ''}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            ref={ref}
            {...getInputProps({
              onChange: (e) => setValue(e.target.valueAsNumber),
              ...column.columnDef.meta?.inputProps,
            })}
          />
          {validationMessage}
        </div>
      )}
    </NumericInputValidator>
  );
});

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
    />
  );
});
