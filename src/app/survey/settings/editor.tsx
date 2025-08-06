'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, QuestionType, MultipleChoiceQuestionProps, SideBySideQuestionProps, TextEntryQuestionProps, SideBySideOption, MultipleChoiceOption, ColumnGroup, SubColumn } from './types';
import type { JSX } from 'react';
import { CounterInput } from './components/CounterInput';

const PreviewModal = {
  renderQuestionPreview: ({ question }: { question: Question }): JSX.Element | null => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE: {
        const props = question.props as MultipleChoiceQuestionProps;
        return (
          <div className="space-y-3">
            {props.options?.map((option: MultipleChoiceOption) => (
              <div key={option.id} className="flex items-center">
                <input type="radio" name={`preview_${question.id}`} className="mr-3" readOnly />
                <label>{option.text}</label>
              </div>
            ))}
          </div>
        );
      }
      case QuestionType.TEXT_ENTRY: {
        const props = question.props as TextEntryQuestionProps;
        return (
          <textarea
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md resize-none"
            placeholder={props.placeholder}
            readOnly
          />
        );
      }
      case QuestionType.SIDE_BY_SIDE: {
        const props = question.props as SideBySideQuestionProps;
        const rows = props.rows || [];
        const columns = props.columns || [];

        if (rows.length === 0 || columns.length === 0) return null;

        return (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2"></th>
                {columns.map((col: ColumnGroup) => (
                  <th key={col.id} className="border p-2 text-center">
                    {col.text}
                    {col.subColumns && col.subColumns.length > 0 && (
                      <div className="flex justify-around mt-1">
                        {col.subColumns.map((subCol: SubColumn) => (
                          <span key={subCol.id} className="font-normal">{subCol.label}</span>
                        ))}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: SideBySideOption) => (
                <tr key={row.id}>
                  <td className="border p-2 font-medium">{row.text}</td>
                  {columns.map((col: ColumnGroup) => (
                    <td key={col.id} className="border p-2">
                      <div className="flex justify-around">
                        {col.subColumns?.map((subCol: SubColumn) => (
                          <input key={subCol.id} type="radio" name={`preview_${question.id}_${row.id}`} />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      default:
        return null;
    }
  }
};

export default function SurveyEditor({ onSave }: { onSave: (questions: Question[]) => void }): JSX.Element {
  const [state, setState] = useState<{
    questions: Question[];
    selectedQuestionId: string | undefined;
    previewMode: boolean;
  }>({
    questions: [],
    selectedQuestionId: undefined,
    previewMode: false
  });

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const addQuestion = useCallback((type: QuestionType) => {
    let newQuestion: Question;
    const baseQuestion = {
        id: `q${Date.now()}`,
        text: '',
        isRequired: false,
    };

    switch (type) {
        case QuestionType.MULTIPLE_CHOICE:
            newQuestion = {
                ...baseQuestion,
                type: QuestionType.MULTIPLE_CHOICE,
                props: {
                    options: [{ id: `opt${Date.now()}`, text: '' }],
                    optionCount: 1
                }
            };
            break;
        case QuestionType.SIDE_BY_SIDE:
            newQuestion = {
                ...baseQuestion,
                type: QuestionType.SIDE_BY_SIDE,
                props: {
                    columns: [
                        { id: `col${Date.now()}-1`, text: '열 1', subColumns: [{ id: `sub${Date.now()}-1-1`, label: '옵션 1' }] },
                        { id: `col${Date.now()}-2`, text: '열 2', subColumns: [{ id: `sub${Date.now()}-2-1`, label: '옵션 1' }] },
                    ],
                    rows: [
                        { id: `row${Date.now()}`, text: '' },
                    ],
                    optionCount: 1,
                    columnCount: 2,
                    subColumnCounts: [1, 1],
                }
            };
            break;
        case QuestionType.TEXT_ENTRY:
            newQuestion = {
                ...baseQuestion,
                type: QuestionType.TEXT_ENTRY,
                props: {
                    maxLength: 100,
                    placeholder: '답변을 입력하세요'
                }
            };
            break;
        default:
            throw new Error(`Unknown question type: ${type}`);
    }
    setState((prev: typeof state) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      selectedQuestionId: newQuestion.id
    }));
  }, []);

  useEffect(() => {
    if (state.questions.length > 0 && !state.selectedQuestionId) {
      setState((prev: typeof state) => ({
        ...prev,
        selectedQuestionId: state.questions[0].id
      }));
    }
  }, [state.questions, state.selectedQuestionId]);

  useEffect(() => {
    if (state.questions.length === 0) {
      addQuestion(QuestionType.MULTIPLE_CHOICE);
    }
  }, [addQuestion, state.questions.length]);

  const updateQuestion = (questionId: string, updates: Partial<Omit<Question, 'props' | 'type'>> & { type?: QuestionType; props?: Partial<Question['props']> }) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId) {
          if (updates.type && updates.type !== q.type) {
            let newProps: Question['props'];
            switch (updates.type) {
              case QuestionType.MULTIPLE_CHOICE:
                newProps = { options: [{ id: `opt${Date.now()}`, text: '' }], optionCount: 1 };
                break;
              case QuestionType.SIDE_BY_SIDE:
                newProps = { 
                  columns: [
                    { id: `col${Date.now()}-1`, text: '열 1', subColumns: [{ id: `sub${Date.now()}-1-1`, label: '옵션 1' }] },
                    { id: `col${Date.now()}-2`, text: '열 2', subColumns: [{ id: `sub${Date.now()}-2-1`, label: '옵션 1' }] },
                  ],
                  rows: [{ id: `row${Date.now()}`, text: '' }],
                  optionCount: 1, 
                  columnCount: 2, 
                  subColumnCounts: [1, 1],
                };
                break;
              case QuestionType.TEXT_ENTRY:
                newProps = { maxLength: 100, placeholder: '답변을 입력하세요' };
                break;
              default:
                newProps = q.props; 
            }
            return { ...q, ...updates, props: newProps } as Question;
          }

          const newProps = updates.props ? { ...q.props, ...updates.props } : q.props;
          return { ...q, ...updates, props: newProps } as Question;
        }
        return q;
      })
    }));
  };

  const updateOptionCount = (questionId: string, count: number) => {
    setState((prev: typeof state) => {
      const newQuestions = prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.MULTIPLE_CHOICE) {
          const props = q.props as MultipleChoiceQuestionProps;
          const currentOptions = props.options || [];
          const newOptionCount = Math.max(1, Math.min(10, count));
          const newOptions = Array.from({ length: newOptionCount }, (_, i) => {
            return currentOptions[i] || { id: `opt${Date.now()}_${i}`, text: '' };
          });
          return {
            ...q,
            props: {
              ...props,
              optionCount: newOptionCount,
              options: newOptions
            }
          } as Question;
        }
        return q;
      });
      return { ...prev, questions: newQuestions };
    });
  };

  const updateColumnCount = (questionId: string, newColumnCount: number) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
          const props = q.props as SideBySideQuestionProps;
          const newColumns = Array.from({ length: newColumnCount }, (_, i) => {
            return props.columns?.[i] || { id: `col${Date.now()}_${i}`, text: `열 ${i + 1}`, subColumns: [{ id: `sub${Date.now()}_${i}_0`, label: '옵션 1' }] };
          });
          return {
            ...q,
            props: {
              ...props,
              columnCount: newColumnCount,
              columns: newColumns,
            }
          } as Question;
        }
        return q;
      })
    }));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.MULTIPLE_CHOICE) {
          const props = q.props as MultipleChoiceQuestionProps;
          return {
            ...q,
            props: {
              ...props,
              options: props.options?.map((opt: MultipleChoiceOption) =>
                opt.id === optionId ? { ...opt, text } : opt
              )
            }
          } as Question;
        }
        return q;
      })
    }));
  };

  const updateSideBySideOptionText = (questionId: string, optionId: string, text: string) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
          const props = q.props as SideBySideQuestionProps;
          return {
            ...q,
            props: {
              ...props,
              rows: (props.rows || []).map((opt: SideBySideOption) =>
                opt.id === optionId ? { ...opt, text } : opt
              )
            }
          } as Question;
        }
        return q;
      })
    }));
  };
  
  const addSideBySideOption = (questionId: string) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
          const props = q.props as SideBySideQuestionProps;
          const newOption: SideBySideOption = {
            id: `row${Date.now()}`,
            text: '',
          };
          return {
            ...q,
            props: {
              ...props,
              rows: [...(props.rows || []), newOption]
            }
          } as Question;
        }
        return q;
      })
    }));
  };

  const removeSideBySideOption = (questionId: string, optionId: string) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
          const props = q.props as SideBySideQuestionProps;
          return {
            ...q,
            props: {
              ...props,
              rows: (props.rows || []).filter((opt: SideBySideOption) => opt.id !== optionId)
            }
          } as Question;
        }
        return q;
      })
    }));
  };

  const updateSideBySideColumnLabel = (questionId: string, columnId: string, text: string) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
          const props = q.props as SideBySideQuestionProps;
          return {
            ...q,
            props: {
              ...props,
              columns: (props.columns || []).map((col: ColumnGroup) => col.id === columnId ? {...col, text } : col)
            }
          } as Question;
        }
        return q;
      })
    }));
  }

  const updateSubColumnCount = (questionId: string, columnIndex: number, newSubColumnCount: number) => {
    setState((prev: typeof state) => ({
        ...prev,
        questions: prev.questions.map(q => {
            if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
                const props = q.props as SideBySideQuestionProps;
                const newColumns = [...(props.columns || [])];
                const targetColumn = newColumns[columnIndex] ?? { id: `col-${Date.now()}`, text: '', subColumns: [] };
                const newSubColumns = Array.from({ length: newSubColumnCount }, (_, i) => {
                    return targetColumn.subColumns?.[i] || { id: `sub-${Date.now()}`, label: `옵션 ${i + 1}` };
                });
                newColumns[columnIndex] = {
                    ...targetColumn,
                    subColumns: newSubColumns,
                };

                return {
                    ...q,
                    props: {
                        ...props,
                        columns: newColumns,
                    }
                } as Question;
            }
            return q;
        })
    }));
  };

  const updateSideBySideSubColumnLabel = (questionId: string, columnId: string, subColumnId: string, label: string) => {
    setState((prev: typeof state) => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id === questionId && q.type === QuestionType.SIDE_BY_SIDE) {
          const props = q.props as SideBySideQuestionProps;
          const newColumns = (props.columns || []).map((col: ColumnGroup) => {
            if (col.id === columnId) {
              const newSubColumns = (col.subColumns || []).map((subCol: SubColumn) => 
                subCol.id === subColumnId ? { ...subCol, label } : subCol
              );
              return { ...col, subColumns: newSubColumns };
            }
            return col;
          });
          return { ...q, props: { ...props, columns: newColumns } } as Question;
        }
        return q;
      })
    }));
  };

  const togglePreview = () => {
    setIsPreviewModalOpen(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(state.questions);
    }
  };

  const currentQuestion = state.questions.find(q => q.id === state.selectedQuestionId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel */}
      <div className="w-1/4 p-5 border-r bg-white overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">질문 목록</h2>
        <div className="space-y-2">
          {state.questions.map((q, index) => (
            <div
              key={q.id}
              className={`p-3 rounded-lg cursor-pointer ${state.selectedQuestionId === q.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setState((prev: typeof state) => ({ ...prev, selectedQuestionId: q.id }))}
            >
              <p className="font-medium truncate">{index + 1}. {q.text || '새 질문'}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <button onClick={() => addQuestion(QuestionType.MULTIPLE_CHOICE)} className="w-full text-left p-2 rounded-md bg-gray-200 hover:bg-gray-300">+ 복수 선택</button>
          <button onClick={() => addQuestion(QuestionType.SIDE_BY_SIDE)} className="w-full text-left p-2 rounded-md bg-gray-200 hover:bg-gray-300">+ 병렬 비교</button>
          <button onClick={() => addQuestion(QuestionType.TEXT_ENTRY)} className="w-full text-left p-2 rounded-md bg-gray-200 hover:bg-gray-300">+ 텍스트 입력</button>
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        {currentQuestion ? (
          <div className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">질문 텍스트</label>
              <input
                type="text"
                value={currentQuestion.text}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(currentQuestion.id, { text: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="질문을 입력하세요"
              />
            </div>

            {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (() => {
              const props = currentQuestion.props as MultipleChoiceQuestionProps;
              return (
                <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                  <h3 className="font-semibold">객관식 옵션</h3>
                  <CounterInput
                    label="옵션 수"
                    value={props.optionCount || 1}
                    minValue={1}
                    maxValue={10}
                    onChange={(count: number) => updateOptionCount(currentQuestion.id, count)}
                  />
                  {props.options?.map((option: MultipleChoiceOption, index: number) => (
                    <div key={option.id} className="flex items-center">
                      <label className="w-24">옵션 {index + 1}</label>
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder={`옵션 ${index + 1}`}
                        value={option.text}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateOption(currentQuestion.id, option.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}

            {currentQuestion.type === QuestionType.TEXT_ENTRY && (() => {
                const props = currentQuestion.props as TextEntryQuestionProps;
                return (
                    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                        <h3 className="font-semibold">텍스트 입력 옵션</h3>
                        <div>
                            <CounterInput label="최대 글자 수" value={props.maxLength || 100} minValue={10} maxValue={500} onChange={(length: number) => updateQuestion(currentQuestion.id, { props: { ...props, maxLength: length } })} />
                        </div>
                        <div>
                            <label>Placeholder:</label>
                            <input type="text" value={props.placeholder || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuestion(currentQuestion.id, { props: { ...props, placeholder: e.target.value } })} className="w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                );
            })()}

            {currentQuestion.type === QuestionType.SIDE_BY_SIDE && (() => {
                const props = currentQuestion.props as SideBySideQuestionProps;
                return (
                    <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                        <h3 className="font-semibold">병렬 비교 옵션</h3>
                        <CounterInput label="열 개수" value={props.columnCount || 2} minValue={1} maxValue={5} onChange={(newCount: number) => updateColumnCount(currentQuestion.id, newCount)} />
                        {props.columns?.map((col: ColumnGroup, colIndex: number) => (
                            <div key={col.id} className="p-3 border rounded-md bg-white">
                                <div className="flex items-center gap-4">
                                    <label>열 {colIndex + 1} 이름:</label>
                                    <input type="text" value={col.text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSideBySideColumnLabel(currentQuestion.id, col.id, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-md" />
                                </div>
                                <div className="mt-2">
                                  <CounterInput label="하위 열 개수" value={col.subColumns?.length || 1} minValue={1} maxValue={5} onChange={(newCount: number) => updateSubColumnCount(currentQuestion.id, colIndex, newCount)} />
                                </div>
                                {col.subColumns?.map((subCol: SubColumn, subColIndex: number) => (
                                    <div key={subCol.id} className="flex items-center gap-2 mt-2 ml-4">
                                        <label>하위 열 {subColIndex + 1}:</label>
                                        <input type="text" value={subCol.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSideBySideSubColumnLabel(currentQuestion.id, col.id, subCol.id, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ))}
                        <hr/>
                        <h4 className="font-semibold">행 옵션</h4>
                        {props.rows?.map((opt: SideBySideOption, optIndex: number) => (
                            <div key={opt.id} className="flex items-center gap-2">
                                <label>행 {optIndex + 1}:</label>
                                <input type="text" value={opt.text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSideBySideOptionText(currentQuestion.id, opt.id, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-md" />
                                <button onClick={() => removeSideBySideOption(currentQuestion.id, opt.id)} className="text-red-500 hover:text-red-700 p-2">삭제</button>
                            </div>
                        ))}
                        <button onClick={() => addSideBySideOption(currentQuestion.id)} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300">+ 행 추가</button>
                    </div>
                );
            })()}

          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">왼쪽 목록에서 질문을 선택하거나 새 질문을 추가하세요.</p>
          </div>
        )}
      </div>

      {/* Right Panel (Save/Preview) */}
       <div className="w-1/5 p-5 bg-white border-l">
        <h2 className="text-lg font-semibold mb-4">작업</h2>
        <div className="space-y-3">
            <button
                onClick={togglePreview}
                className="w-full bg-white text-blue-500 border-blue-500 border-2 px-4 py-2 rounded hover:bg-blue-50 transition-colors disabled:opacity-50"
                disabled={!currentQuestion}
              >
                미리보기
              </button>
              <button
                onClick={handleSave}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                저장하기
              </button>
        </div>
      </div>


        {/* Preview Modal */}
        {isPreviewModalOpen && currentQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setIsPreviewModalOpen(false)}>
            <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">설문조사 미리보기</h2>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="space-y-8">
                  <div className="border-b pb-6 last:border-0">
                      <div className="font-semibold text-lg mb-4">{currentQuestion.text}</div>
                      {PreviewModal.renderQuestionPreview({ question: currentQuestion })}
                  </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
