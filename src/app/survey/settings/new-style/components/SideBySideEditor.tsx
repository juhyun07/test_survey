import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface Answer {
  id: string;
  text: string;
  label?: string;
}

interface SubColumn {
  id: string;
  label: string;
  answers?: Answer[];
}

interface MatrixRow {
  id: string;
  label: string;
  columns?: Array<{
    title: string;
    answers: Answer[];
  }>;
}

interface MatrixColumn {
  id: string;
  label: string;
  subColumns: SubColumn[];
}

interface SideBySideEditorProps {
  question?: string;
  isRequired?: boolean;
  rows?: MatrixRow[];
  columns?: MatrixColumn[];
  onQuestionChange?: (text: string) => void;
  onRequiredChange?: (required: boolean) => void;
  onRowsChange?: (rows: MatrixRow[]) => void;
  onColumnsChange?: (columns: MatrixColumn[]) => void;
  onOptionCountChange?: (count: number) => void;
  onColumnCountChange?: (count: number) => void;
  onSubColumnCountsChange?: (counts: number[]) => void;
}

interface SideBySideEditorRef {
  getState: () => {
    question: string;
    isRequired: boolean;
    rows: MatrixRow[];
    columns: MatrixColumn[];
    sideBySideOptions: Array<{
      id: string;
      text: string;
      descriptionCount: number;
      columns: Array<{
        title: string;
        answers: Array<{
          id: string;
          text: string;
        }>;
      }>;
    }>;
    optionCount: number;
    columnCount: number;
    subColumnCounts: number[];
  };
}

export const SideBySideEditor = forwardRef<SideBySideEditorRef, SideBySideEditorProps>(
  (
    {
      question: initialQuestion = '',
      isRequired: initialIsRequired = false,
      rows: initialRows = [
        { id: 'r1', label: '항목 1' },
        { id: 'r2', label: '항목 2' },
      ],
      columns: initialColumns = [
        {
          id: 'c1',
          label: '열 1',
          subColumns: [
            { id: 'sc1', label: '하위 1-1' },
            { id: 'sc2', label: '하위 1-2' },
          ],
        },
        {
          id: 'c2',
          label: '열 2',
          subColumns: [
            { id: 'sc3', label: '하위 2-1' },
            { id: 'sc4', label: '하위 2-2' },
          ],
        },
      ],
      onQuestionChange,
      onRequiredChange,
      onRowsChange,
      onColumnsChange,
      onOptionCountChange,
      onColumnCountChange,
      onSubColumnCountsChange,
    },
    ref
  ) => {
    SideBySideEditor.displayName = 'SideBySideEditor';
    const [question, setQuestion] = useState<string>(initialQuestion);
    const [isRequired, setIsRequired] = useState<boolean>(initialIsRequired);
    const [rows, setRows] = useState<MatrixRow[]>(initialRows);
    const [columns, setColumns] = useState<MatrixColumn[]>(initialColumns);

    useEffect(() => {
      setQuestion(initialQuestion);
      setIsRequired(initialIsRequired);
      setRows(initialRows);
      setColumns(initialColumns);
    }, [initialQuestion, initialIsRequired, initialRows, initialColumns]);

    const addRow = () => {
      const newId = `row-${Date.now()}`;
      const newRow = { id: newId, label: `항목 ${rows.length + 1}` };
      const newRows = [...rows, newRow];
      setRows(newRows);
      onRowsChange?.(newRows);
      onOptionCountChange?.(newRows.length);
    };

    const updateRow = (id: string, newLabel: string) => {
      const newRows = rows.map((row) =>
        row.id === id ? { ...row, label: newLabel } : row
      );
      setRows(newRows);
      onRowsChange?.(newRows);
    };

    const removeRow = (id: string) => {
      if (rows.length <= 1) return;
      const newRows = rows.filter((row) => row.id !== id);
      setRows(newRows);
      onRowsChange?.(newRows);
      onOptionCountChange?.(newRows.length);
    };

    const addColumnGroup = () => {
      const newId = `col-${Date.now()}`;
      const newColumn: MatrixColumn = {
        id: newId,
        label: `열 ${columns.length + 1}`,
        subColumns: [
          { id: `${newId}-1`, label: '옵션 1' },
          { id: `${newId}-2`, label: '옵션 2' },
        ],
      };
      const newColumns = [...columns, newColumn];
      setColumns(newColumns);
      onColumnsChange?.(newColumns);
      onColumnCountChange?.(newColumns.length);
      onSubColumnCountsChange?.(newColumns.map((col) => col.subColumns.length));
    };

    const updateColumnGroup = (id: string, newLabel: string) => {
      const newColumns = columns.map((column) =>
        column.id === id ? { ...column, label: newLabel } : column
      );
      setColumns(newColumns);
      onColumnsChange?.(newColumns);
    };

    const removeColumnGroup = (id: string) => {
      if (columns.length <= 1) return;
      const newColumns = columns.filter((column) => column.id !== id);
      setColumns(newColumns);
      onColumnsChange?.(newColumns);
      onColumnCountChange?.(newColumns.length);
      onSubColumnCountsChange?.(newColumns.map((col) => col.subColumns.length));
    };

    const addSubColumn = (columnId: string) => {
      const newColumns = columns.map((col) => {
        if (col.id === columnId) {
          const newSubColumn = {
            id: `${columnId}-${col.subColumns.length + 1}`,
            label: `옵션 ${col.subColumns.length + 1}`,
          };
          return { ...col, subColumns: [...col.subColumns, newSubColumn] };
        }
        return col;
      });
      setColumns(newColumns);
      onColumnsChange?.(newColumns);
      onSubColumnCountsChange?.(newColumns.map((col) => col.subColumns.length));
    };

    const removeSubColumn = (
      columnId: string,
      subColumnId: string,
      e: React.MouseEvent
    ) => {
      e.stopPropagation();
      const newColumns = columns.map((col) => {
        if (col.id === columnId && col.subColumns.length > 1) {
          return {
            ...col,
            subColumns: col.subColumns.filter((sc) => sc.id !== subColumnId),
          };
        }
        return col;
      });
      setColumns(newColumns);
      onColumnsChange?.(newColumns);
      onSubColumnCountsChange?.(newColumns.map((col) => col.subColumns.length));
    };

    const updateSubColumn = (
      columnId: string,
      subColumnId: string,
      newLabel: string
    ) => {
      const newColumns = columns.map((column) => {
        if (column.id === columnId) {
          const newSubColumns = column.subColumns.map((subCol) =>
            subCol.id === subColumnId ? { ...subCol, label: newLabel } : subCol
          );
          return { ...column, subColumns: newSubColumns };
        }
        return column;
      });
      setColumns(newColumns);
      onColumnsChange?.(newColumns);
    };

    useImperativeHandle(ref, () => ({
      getState: () => {
        const sideBySideOptions = rows.map((row) => ({
          id: row.id,
          text: row.label,
          descriptionCount: 0,
          columns: columns.map((col) => ({
            title: col.label,
            answers: col.subColumns.map((sc) => ({ id: sc.id, text: sc.label })),
          })),
        }));
        const subColumnCounts = columns.map((col) => col.subColumns.length);
        return {
          question,
          isRequired,
          rows: [...rows],
          columns: columns.map((col) => ({ ...col, subColumns: [...col.subColumns] })),
          sideBySideOptions,
          optionCount: rows.length,
          columnCount: columns.length,
          subColumnCounts,
        };
      },
    }));

    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              onQuestionChange?.(e.target.value);
            }}
            placeholder="질문을 입력하세요"
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">행 관리</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeRow(rows[rows.length - 1]?.id);
              }}
              disabled={rows.length <= 1}
              className="p-1 rounded-full bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="마지막 행 삭제"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addRow();
              }}
              className="p-1 rounded-full bg-blue-500 text-white"
              title="행 추가"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">열 그룹 관리</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeColumnGroup(columns[columns.length - 1]?.id);
              }}
              disabled={columns.length <= 1}
              className="p-1 rounded-full bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="마지막 열 그룹 삭제"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addColumnGroup();
              }}
              className="p-1 rounded-full bg-blue-500 text-white"
              title="열 그룹 추가"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative border rounded-md p-4 bg-white">
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="relative">
              <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap"
                      style={{ width: '200px' }}
                    >
                      <span>항목</span>
                    </th>
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        colSpan={column.subColumns.length}
                        className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative group whitespace-nowrap"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <input
                            type="text"
                            value={column.label}
                            onChange={(e) => updateColumnGroup(column.id, e.target.value)}
                            className="p-1 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md w-24"
                          />
                          <button
                            type="button"
                            onClick={() => addSubColumn(column.id)}
                            className="p-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            title="서브 컬럼 추가"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    <th className="w-[200px] bg-gray-50" style={{ width: '200px' }}></th>
                    {columns.map((column) =>
                      column.subColumns.map((subColumn) => (
                        <th key={subColumn.id} className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center justify-center">
                            <input
                              type="text"
                              value={subColumn.label}
                              onChange={(e) => updateSubColumn(column.id, subColumn.id, e.target.value)}
                              className="p-1 text-center bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md w-24"
                            />
                            <button
                              type="button"
                              onClick={(e) => removeSubColumn(column.id, subColumn.id, e)}
                              className="p-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={column.subColumns.length <= 1}
                              title="마지막 서브 컬럼 삭제"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                              </svg>
                            </button>
                          </div>
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-4 whitespace-nowrap border-r bg-white" style={{ width: '200px', minWidth: '200px' }}>
                        <div className="flex items-center">
                          <input
                            type="text"
                            className="border-0 p-0 focus:ring-0 focus:border-blue-500 block w-full sm:text-sm"
                            value={row.label}
                            onChange={(e) => updateRow(row.id, e.target.value)}
                          />
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                removeRow(row.id);
                              }}
                              className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                              title="행 삭제"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      {columns.map((column) =>
                        column.subColumns.map((subCol) => (
                          <td key={subCol.id} className="px-6 py-4 whitespace-nowrap text-center border-l">
                            <input
                              type="radio"
                              name={`${row.id}-${column.id}`}
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                            />
                          </td>
                        ))
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="is-required"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isRequired}
                onChange={(e) => {
                  setIsRequired(e.target.checked);
                  onRequiredChange?.(e.target.checked);
                }}
              />
              <label htmlFor="is-required" className="ml-2 block text-sm text-gray-900">
                필수 응답
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
