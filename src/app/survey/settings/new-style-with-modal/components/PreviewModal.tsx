'use client';

import React from 'react';
import { Question, QuestionType, MultipleChoiceQuestionProps, SideBySideQuestionProps, TextEntryQuestionProps } from '../../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
}

export function PreviewModal({ isOpen, onClose, questions }: PreviewModalProps) {
  if (!isOpen) return null;

  const renderQuestionPreview = (question: Question) => {
    const props = question.props;
    
    switch (question.type) {
      case QuestionType.CHECKBOX:
      case QuestionType.MULTIPLE_CHOICE: {
        const mcProps = props as MultipleChoiceQuestionProps;
        return (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">미리보기: 객관식 질문</h3>
            <p className="text-gray-700">{question.text}</p>
            <div className="space-y-2 mt-4">
              {mcProps.options?.map((option) => (
                <div key={option.id} className="flex items-center py-1">
                  <input
                    type={question.type === QuestionType.CHECKBOX ? 'checkbox' : 'radio'}
                    id={`preview-${option.id}`}
                    name={`preview-option-${question.id}`}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`preview-${option.id}`} className="ml-2 text-gray-700">
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      case QuestionType.SIDE_BY_SIDE: {
        const renderSideBySidePreview = () => {
          const props = question.props as SideBySideQuestionProps;
          const { 
            rows = [], 
            columns = [] 
          } = props;
          
          if (rows.length === 0 || columns.length === 0) {
            return <div className="text-gray-500">미리보기 데이터가 없습니다.</div>;
          }

          // 모든 컬럼의 서브 컬럼을 평탄화하여 헤더 생성
          const allSubColumns = columns.flatMap((col) => 
            col.subColumns.map((subCol) => ({
              ...subCol,
              uniqueId: `${col.id}-${subCol.id}`,
              columnTitle: col.text
            }))
          );

          return (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">미리보기: 병렬 비교 질문</h3>
              <p className="text-gray-700">{question.text}</p>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border-t border-b border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"></th>
                      {columns.map((column) => (
                        <th 
                          key={column.id} 
                          colSpan={column.subColumns.length}
                          className="px-3 py-2 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {column.text}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">항목</th>
                      {allSubColumns.map((subCol) => (
                        <th key={subCol.uniqueId} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          {subCol.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td className="w-[200px] px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.text}</td>
                        {allSubColumns.map((subCol) => (
                          <td key={`${row.id}-${subCol.uniqueId}`} className="px-3 py-4 whitespace-nowrap text-center">
                            <input
                              type="radio"
                              name={`preview_${question.id}_${row.id}`}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              readOnly
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        };

        return renderSideBySidePreview();
      }
      
      case QuestionType.TEXT_ENTRY: {
        const teProps = props as TextEntryQuestionProps;
        return (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">미리보기: 주관식 질문</h3>
            <p className="text-gray-700">{question.text}</p>
            <textarea
              className="w-full mt-2 p-2 border rounded-md"
              rows={4}
              placeholder={teProps.placeholder || '답변을 입력하세요'}
              maxLength={teProps.maxLength}
            />
            {teProps.maxLength && (
              <p className="text-sm text-gray-500 text-right">
                최대 {teProps.maxLength}자까지 입력 가능
              </p>
            )}
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">설문조사 미리보기</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-8">
            {questions?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                추가된 질문이 없습니다.
              </div>
            ) : (
              questions.map((question, index) => (
                <div key={question.id} className="border-b pb-6 last:border-b-0">
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-700 mr-2">Q{index + 1}.</span>
                    <span className="text-gray-500 text-sm">
                      {question.type === QuestionType.MULTIPLE_CHOICE && '복수 선택'}
                      {question.type === QuestionType.CHECKBOX && '체크박스'}
                      {question.type === QuestionType.SIDE_BY_SIDE && '병렬 비교'}
                      {question.type === QuestionType.TEXT_ENTRY && '텍스트 답변'}
                    </span>
                    {question.isRequired && (
                      <span className="ml-2 text-red-500 text-sm">(필수)</span>
                    )}
                  </div>
                  {renderQuestionPreview(question)}
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
