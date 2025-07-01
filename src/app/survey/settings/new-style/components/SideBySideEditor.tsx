import React, { useState } from 'react';

type MatrixRow = {
  id: string;
  label: string;
};

type MatrixColumn = {
  id: string;
  label: string;
  subColumns: Array<{
    id: string;
    label: string;
  }>;
};

export const SideBySideEditor: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(false);
  const [rows, setRows] = useState<MatrixRow[]>([
    { id: 'r1', label: '항목 1' },
    { id: 'r2', label: '항목 2' },
  ]);
  
  const [columns, setColumns] = useState<MatrixColumn[]>([
    {
      id: 'col1',
      label: '열 1',
      subColumns: [
        { id: 'c1', label: '옵션 1' },
      ]
    }
  ]);

  // 행 추가
  const addRow = () => {
    const newId = `r${Date.now()}`;
    setRows([...rows, { id: newId, label: `항목 ${rows.length + 1}` }]);
  };

  // 행 업데이트
  const updateRow = (id: string, newLabel: string) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, label: newLabel } : row
    ));
  };

  // 행 삭제
  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    }
  };

  // 열 그룹 추가
  const addColumnGroup = () => {
    const newId = `col${Date.now()}`;
    const newColumn: MatrixColumn = {
      id: newId,
      label: `열 ${columns.length + 1}`,
      subColumns: [
        { id: `${newId}-1`, label: '옵션 1' },
      ]
    };
    setColumns([...columns, newColumn]);
  };

  // 열 그룹 레이블 업데이트
  const updateColumnGroup = (id: string, newLabel: string) => {
    setColumns(columns.map(column => 
      column.id === id ? { ...column, label: newLabel } : column
    ));
  };

  // 열 그룹 삭제
  const removeColumnGroup = (id: string) => {
    if (columns.length > 1) {
      setColumns(columns.filter(column => column.id !== id));
    }
  };

  // 서브 컬럼 추가
  const addSubColumn = (columnId: string) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        const newSubColumnId = `${columnId}-${Date.now()}`;
        return {
          ...column,
          subColumns: [
            ...column.subColumns,
            { id: newSubColumnId, label: `옵션 ${column.subColumns.length + 1}` }
          ]
        };
      }
      return column;
    }));
  };

  // 서브 컬럼 삭제
  const removeSubColumn = (columnId: string, subColumnId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setColumns(prevColumns => {
      const newColumns = prevColumns.map(column => {
        if (column.id === columnId) {
          const filtered = column.subColumns.filter(sc => sc.id !== subColumnId);
          // 마지막 서브 컬럼은 삭제하지 않음
          if (filtered.length === 0) return column;
          return {
            ...column,
            subColumns: filtered
          };
        }
        return column;
      });
      return newColumns;
    });
  };

  // 서브 컬럼 레이블 업데이트
  const updateSubColumn = (columnId: string, subColumnId: string, newLabel: string) => {
    setColumns(columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          subColumns: column.subColumns.map(sc => 
            sc.id === subColumnId ? { ...sc, label: newLabel } : sc
          )
        };
      }
      return column;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="질문을 입력하세요"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">행 관리</span>
          <button
            onClick={() => removeRow(rows[rows.length - 1]?.id)}
            disabled={rows.length <= 1}
            className="p-1 rounded-full bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="마지막 행 삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={addRow}
            className="p-1 rounded-full bg-blue-500 text-white"
            title="행 추가"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">열 그룹 관리</span>
          <button
            onClick={() => removeColumnGroup(columns[columns.length - 1]?.id)}
            disabled={columns.length <= 1}
            className="p-1 rounded-full bg-red-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            title="마지막 열 그룹 삭제"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={addColumnGroup}
            className="p-1 rounded-full bg-blue-500 text-white"
            title="열 그룹 추가"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative border rounded-md p-4 bg-white">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="relative">
            <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
              <thead className="bg-gray-50">
                {/* 열 그룹 헤더 */}
                <tr>
                  <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap" style={{ width: '200px' }}>
                    <span>항목</span>
                  </th>
                {columns.map((column, colIndex) => (
                  <th 
                    key={column.id} 
                    colSpan={column.subColumns.length}
                    className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative group whitespace-nowrap"
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          className="w-full text-center border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 bg-transparent font-semibold"
                          value={column.label}
                          onChange={(e) => updateColumnGroup(column.id, e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => addSubColumn(column.id)}
                          className="p-0.5 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          title="서브 컬럼 추가"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const lastSubCol = column.subColumns[column.subColumns.length - 1];
                            if (lastSubCol && column.subColumns.length > 1) {
                              removeSubColumn(column.id, lastSubCol.id, e);
                            }
                          }}
                          className="p-0.5 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={column.subColumns.length <= 1}
                          title="마지막 서브 컬럼 삭제"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
              
              {/* 서브 컬럼 헤더 */}
              <tr>
                  <th className="px-6 py-2 bg-gray-50" style={{ width: '200px' }}></th>
                {columns.map((column, colIndex) => (
                  <React.Fragment key={`${column.id}-sub`}>
                    {column.subColumns.map((subCol, subIndex) => (
                      <th 
                        key={subCol.id} 
                        className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l border-r border-gray-200 whitespace-nowrap min-w-[100px]"
                        style={{
                          borderRight: `${subIndex === column.subColumns.length - 1 ? '2' : '1'}px solid ${subIndex === column.subColumns.length - 1 ? '#9ca3af' : '#e5e7eb'}`,
                          borderLeft: `${colIndex === 0 && subIndex === 0 ? '2' : '1'}px solid ${colIndex === 0 && subIndex === 0 ? '#9ca3af' : '#e5e7eb'}`
                        }}
                      >
                        <div className="relative group flex items-center">
                          <input
                            type="text"
                            className="w-full text-center border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-500 bg-transparent text-xs"
                            value={subCol.label}
                            onChange={(e) => updateSubColumn(column.id, subCol.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          {column.subColumns.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubColumn(column.id, subCol.id, e);
                              }}
                              className="absolute right-0 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 z-10 pointer-events-auto"
                              title="서브 컬럼 삭제"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </React.Fragment>
                ))}
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
                          onClick={() => removeRow(row.id)}
                          className="ml-2 text-red-500 hover:text-red-700"
                          title="행 삭제"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </td>
                  {columns.map((column) => (
                    <td 
                      key={column.id} 
                      colSpan={column.subColumns.length}
                      className="px-0 py-4 whitespace-nowrap border-l border-r border-gray-200"
                      style={{
                        borderRight: '2px solid #9ca3af'
                      }}
                    >
                      <div className="flex">
                        {column.subColumns.map((subCol) => (
                          <div 
                            key={subCol.id} 
                            className="flex-1 flex justify-center border-l first:border-l-0"
                          >
                            <input
                              type="radio"
                              name={`row-${row.id}-col-${column.id}`}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
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
              type="checkbox"
              id="required"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
              필수 질문
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
