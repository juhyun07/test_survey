'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { v4 as uuidv4 } from 'uuid';

type SideBySideOption = {
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
};
import { QuestionType, Question } from '../types';
import { MultipleChoiceEditor } from './components/MultipleChoiceEditor';
import { SideBySideEditor } from './components/SideBySideEditor';
import { TextEntryEditor } from './components/TextEntryEditor';
import { PreviewModal } from './components/PreviewModal';

// 기본 질문 데이터
const createNewQuestion = (type: QuestionType): Question => {
  const id = uuidv4();
  const baseQuestion = {
    id,
    type,
    text: '새 질문',
    required: false,
    props: {},
  };

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return {
        ...baseQuestion,
        options: [
          { id: uuidv4(), text: '옵션 1' },
          { id: uuidv4(), text: '옵션 2' },
        ],
        optionCount: 2,
        props: {
          options: [
            { id: '1', text: '옵션 1' },
            { id: '2', text: '옵션 2' },
          ],
          optionCount: 2,
        },
      };
    case QuestionType.SIDE_BY_SIDE:
      return {
        ...baseQuestion,
        optionCount: 2,
        columnCount: 2,
        props: {
          rows: [
            { id: 'r1', label: '항목 1' },
            { id: 'r2', label: '항목 2' },
          ],
          columns: [
            {
              id: 'c1',
              label: '열 1',
              subColumns: [
                { id: 'c1-1', label: '옵션 1' },
                { id: 'c1-2', label: '옵션 2' },
              ],
            },
            {
              id: 'c2',
              label: '열 2',
              subColumns: [
                { id: 'c2-1', label: '옵션 1' },
                { id: 'c2-2', label: '옵션 2' },
              ],
            },
          ],
          optionCount: 2,
          columnCount: 2,
          subColumnCounts: [2, 2],
        },
      };
    case QuestionType.TEXT_ENTRY:
      return {
        ...baseQuestion,
        props: {
          maxLength: 100,
          placeholder: '답변을 입력하세요',
        },
      };
    default:
      return {
        ...baseQuestion,
        type: QuestionType.MULTIPLE_CHOICE,
        options: [],
        props: {},
      };
  }
};

export default function QualtricsStyleSurveyEditor() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // 질문 펼침/접기 상태 토글
  const toggleQuestionExpansion = (index: number) => {
    setQuestions(prev => 
      prev.map((q, i) => 
        i === index ? { ...q, isExpanded: !q.isExpanded } : q
      )
    );
  };

  // 질문 업데이트 핸들러
  const handleUpdateQuestion = (idOrIndex: string | number, updates: Partial<Question>) => {
    setQuestions(prev => 
      prev.map((q, i) => {
        // ID로 비교하거나 인덱스로 비교
        const isTarget = typeof idOrIndex === 'string' 
          ? q.id === idOrIndex 
          : i === idOrIndex;
          
        if (isTarget) {
          // props가 있는 경우 기존 props와 병합
          if (updates.props) {
            return { 
              ...q, 
              ...updates,
              props: { ...q.props, ...updates.props }
            };
          }
          return { ...q, ...updates };
        }
        return q;
      })
    );
  };

  // 에디터 상태를 저장할 refs
  const multipleChoiceRef = useRef<{ getState: () => any }>(null);
  const sideBySideRef = useRef<{ getState: () => any }>(null);
  const textEntryRef = useRef<{ getState: () => any }>(null);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = createNewQuestion(type);
    newQuestion.isExpanded = true;
    newQuestion.id = Date.now().toString();
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  // 현재 에디터의 상태를 가져오는 함수
  const getCurrentEditorState = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return multipleChoiceRef.current?.getState?.();
      case QuestionType.SIDE_BY_SIDE:
        return sideBySideRef.current?.getState?.();
      case QuestionType.TEXT_ENTRY:
        return textEntryRef.current?.getState?.();
      default:
        return null;
    }
  };

  // 상태 객체로부터 질문 객체 생성
  const createQuestionFromState = (type: QuestionType, state: any, existingQuestion?: Question): Question => {
    // 기존 질문이 있으면 해당 ID와 isExpanded 상태를 유지
    const baseQuestion: Question = {
      id: existingQuestion?.id || uuidv4(),
      type,
      text: state.question || '새 질문',
      required: state.isRequired || false,
      isExpanded: existingQuestion?.isExpanded ?? true,
      options: [],
      optionCount: 0,
      props: {},
    };

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return {
          ...baseQuestion,
          options: state.options || [],
          optionCount: state.options?.length || 0,
          props: {
            ...baseQuestion.props,
            options: state.options || [],
            optionCount: state.options?.length || 0,
          },
        };
      case QuestionType.SIDE_BY_SIDE:
        return {
          ...baseQuestion,
          optionCount: state.rows?.length || 0,
          columnCount: state.columns?.length || 0,
          props: {
            ...baseQuestion.props,
            rows: state.rows || [],
            columns: state.columns || [],
            optionCount: state.rows?.length || 0,
            columnCount: state.columns?.length || 0,
            subColumnCounts: state.columns?.map((col: any) => col.subColumns?.length || 0) || [],
          },
        };
      case QuestionType.TEXT_ENTRY:
        return {
          ...baseQuestion,
          props: {
            maxLength: state.maxLength || 100,
            placeholder: state.placeholder || '답변을 입력하세요',
          },
        };
      default:
        return baseQuestion;
    }
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const renderEditor = (question: Question) => {
    const commonProps = {
      key: question.id,
      ref: (ref: any) => {
        switch (question.type) {
          case QuestionType.MULTIPLE_CHOICE:
            multipleChoiceRef.current = ref;
            break;
          case QuestionType.SIDE_BY_SIDE:
            sideBySideRef.current = ref;
            break;
          case QuestionType.TEXT_ENTRY:
            textEntryRef.current = ref;
            break;
        }
      },
      question: question.text,
      isRequired: question.required,
    };

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceEditor
            {...commonProps}
            options={question.options || []}
            onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
            onRequiredChange={(required) => handleUpdateQuestion(question.id, { required })}
            onOptionsChange={(options) => handleUpdateQuestion(question.id, { 
              options, 
              optionCount: options.length 
            })}
            onOptionCountChange={(count) => handleUpdateQuestion(question.id, { 
              optionCount: count 
            })}
          />
        );
      case QuestionType.SIDE_BY_SIDE:
        return (
          <SideBySideEditor
            {...commonProps}
            rows={question.props?.rows || []}
            columns={question.props?.columns || []}
            onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
            onRequiredChange={(required) => handleUpdateQuestion(question.id, { required })}
            onRowsChange={(rows) => handleUpdateQuestion(question.id, { 
              props: { 
                ...question.props,
                rows,
                optionCount: rows.length 
              } 
            })}
            onColumnsChange={(columns) => handleUpdateQuestion(question.id, { 
              props: { 
                ...question.props, 
                columns,
                subColumnCounts: columns.map(col => col.subColumns.length),
                columnCount: columns.length
              } 
            })}
            onOptionCountChange={(count) => handleUpdateQuestion(question.id, { 
              props: { 
                ...question.props,
                optionCount: count 
              } 
            })}
            onColumnCountChange={(count) => handleUpdateQuestion(question.id, { 
              props: { 
                ...question.props, 
                columnCount: count 
              } 
            })}
            onSubColumnCountsChange={(counts) => handleUpdateQuestion(question.id, { 
              props: { 
                ...question.props, 
                subColumnCounts: counts 
              } 
            })}
          />
        );
      case QuestionType.TEXT_ENTRY:
        return (
          <TextEntryEditor
            {...commonProps}
            maxLength={question.props?.maxLength}
            placeholder={question.props?.placeholder}
            onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
            onRequiredChange={(required) => handleUpdateQuestion(question.id, { required })}
            onMaxLengthChange={(maxLength) => handleUpdateQuestion(question.id, { 
              props: { ...question.props, maxLength } 
            })}
            onPlaceholderChange={(placeholder) => handleUpdateQuestion(question.id, { 
              props: { ...question.props, placeholder } 
            })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">설문조사 편집기</h1>
        <div className="space-x-2">
          <button
            onClick={handlePreview}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            미리보기
          </button>
        </div>
      </div>

      {/* 질문 추가 버튼 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">새 질문 추가</label>
        <div className="flex space-x-3">
          <button
            onClick={() => handleAddQuestion(QuestionType.MULTIPLE_CHOICE)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            복수 선택
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.SIDE_BY_SIDE)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            병렬 비교
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.TEXT_ENTRY)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            텍스트 답변
          </button>
        </div>
      </div>

      {/* 질문 목록 */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
          >
            <div 
              className="flex justify-between items-center p-4 bg-gray-50 border-b cursor-pointer"
              onClick={() => toggleQuestionExpansion(index)}
            >
              <div className="flex items-center">
                <span className="font-medium text-gray-700 mr-3">Q{index + 1}.</span>
                <span className="text-gray-700">
                  {question.text || '새 질문'}
                </span>
                <span className="ml-3 text-sm text-gray-500">
                  ({question.type === QuestionType.MULTIPLE_CHOICE && '복수 선택'}
                  {question.type === QuestionType.SIDE_BY_SIDE && '병렬 비교'}
                  {question.type === QuestionType.TEXT_ENTRY && '텍스트 답변'})
                </span>
                {question.required && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    필수
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveQuestion(index);
                  }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleQuestionExpansion(index);
                  }}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${question.isExpanded ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {question.isExpanded && (
              <div className="p-4">
                <div className="mb-4">
                  {renderEditor(question)}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      // 현재 에디터의 상태를 가져와서 저장
                      const state = getCurrentEditorState(question.type);
                      if (state) {
                        // 기존 질문의 상태를 유지하면서 업데이트
                        handleUpdateQuestion(question.id, {
                          text: state.question || question.text,
                          required: state.isRequired ?? question.required,
                          ...(question.type === QuestionType.MULTIPLE_CHOICE && {
                            options: state.options,
                            optionCount: state.options?.length || 0
                          }),
                          props: {
                            ...question.props,
                            ...(question.type === QuestionType.SIDE_BY_SIDE && {
                              rows: state.rows,
                              columns: state.columns,
                              optionCount: state.rows?.length || 0,
                              columnCount: state.columns?.length || 0,
                              subColumnCounts: state.columns?.map((col: any) => col.subColumns?.length || 0) || []
                            }),
                            ...(question.type === QuestionType.TEXT_ENTRY && {
                              maxLength: state.maxLength,
                              placeholder: state.placeholder
                            })
                          }
                        });
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 미리보기 모달 */}
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={closePreview} 
        questions={questions} 
      />
    </div>
  );
}
