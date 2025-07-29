'use client';

import React, { useState } from 'react';
import { Question, QuestionType, MultipleChoiceOption, SideBySideOption, MultipleChoiceQuestionProps, SideBySideQuestionProps, TextEntryQuestionProps, SavedSurvey } from '../../types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onSave?: (survey: Omit<SavedSurvey, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function PreviewModal({ isOpen, onClose, questions, onSave }: PreviewModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});

  const handleSaveClick = () => {
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = () => {
    if (!title.trim()) {
      alert('설문지 제목을 입력해주세요.');
      return;
    }

    if (onSave) {
      onSave({
        title: title.trim(),
        description: description.trim(),
        questions: [...questions],
      });
    }
    
    setIsSaveModalOpen(false);
    onClose();
  };
  // 저장 모달 렌더링
  const renderSaveModal = () => {
    if (!isSaveModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-md">
          <h3 className="text-xl font-bold mb-6">설문지 저장</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="설문지 제목을 입력하세요"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 (선택사항)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="설문지에 대한 간단한 설명을 입력하세요"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-8">
            <button
              onClick={() => setIsSaveModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={handleConfirmSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              저장하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  const renderQuestionPreview = (question: Question, index: number) => {
    const props = question.props;
    
    // 질문 번호 (Q1, Q2, ...)
    const questionNumber = `Q${index + 1}`;
    
    switch (question.type) {
      case QuestionType.CHECKBOX:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE: {
        // 현재 질문의 옵션을 그대로 사용
        const options = question.options || [];
        const isMultiple = question.type === QuestionType.MULTIPLE_CHOICE_MULTIPLE || question.type === QuestionType.CHECKBOX;

        const handleOptionToggle = (questionId: string, optionId: string) => {
          setSelectedOptions(prev => {
            const currentSelections = prev[questionId] || [];
            let newSelections;

            if (isMultiple) {
              newSelections = currentSelections.includes(optionId)
                ? currentSelections.filter(id => id !== optionId)
                : [...currentSelections, optionId];
            } else {
              newSelections = [optionId];
            }
            return { ...prev, [questionId]: newSelections };
          });
        };

        const renderOptions = (optionsToRender: MultipleChoiceOption[], level = 0) => {
          return optionsToRender.map((option, index) => {
            const isSelected = selectedOptions[question.id]?.includes(option.id);
            return (
              <div key={option.id || index} style={{ marginLeft: `${level * 2}rem` }}>
                <div className="flex items-center py-1">
                  <input
                    type={isMultiple ? 'checkbox' : 'radio'}
                    name={`preview-${question.id}`}
                    id={`preview-${question.id}-${option.id}`}
                    checked={isSelected}
                    onChange={() => handleOptionToggle(question.id, option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`preview-${question.id}-${option.id}`} className="ml-2 text-gray-700">
                    {option.text || `옵션 ${index + 1}`}
                  </label>
                </div>
                {isSelected && option.children && (
                  <div className="mt-2">
                    {renderOptions(option.children, level + 1)}
                  </div>
                )}
              </div>
            );
          });
        };

        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <h3 className="text-lg font-medium">
                {questionNumber}. {question.text}
              </h3>
              {question.required && <span className="text-red-500 ml-2 font-semibold">* 필수</span>}
            </div>
            <div className="space-y-2 mt-2 ml-4">
              {renderOptions(options)}
            </div>
          </div>
        );
      }
      
      case QuestionType.SIDE_BY_SIDE: {
        const renderSideBySidePreview = () => {
          const props = question.props as any;
          const rows = props.rows || [];
          const columns = props.columns || [];
          
          if (rows.length === 0 || columns.length === 0) {
            return <div className="text-gray-500">미리보기 데이터가 없습니다. 행과 열을 추가해주세요.</div>;
          }

          // 모든 컬럼의 서브 컬럼을 평탄화하여 헤더 생성
          const allSubColumns = columns.flatMap((col: any) => 
            (col.subColumns || []).map((subCol: any) => ({
              ...subCol,
              columnTitle: col.label || `열 ${col.id || ''}`,
              columnId: col.id
            }))
          );

          return (
            <div className="space-y-2">
              <div className="flex items-center mb-2">
                <h3 className="text-lg font-medium">
                  {questionNumber}. {question.text}
                </h3>
                {question.required && <span className="text-red-500 ml-2 font-semibold">* 필수</span>}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-100" rowSpan={2} style={{ width: '200px' }}>항목</th>
                      {columns.map((col: any, colIndex: number) => (
                        <th 
                          key={col.id || colIndex} 
                          className="border p-2 bg-gray-50"
                          colSpan={(col.subColumns || []).length}
                        >
                          {col.label || `열 ${colIndex + 1}`}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {allSubColumns.map((subCol: any, index: number) => (
                        <th key={subCol.id || index} className="border p-2 bg-gray-50 text-sm">
                          {subCol.label || `옵션 ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row: any, rowIndex: number) => (
                      <tr key={row.id || rowIndex}>
                        <td className="border p-2 font-medium align-top" style={{ width: '200px' }}>
                          {row.label || `항목 ${rowIndex + 1}`}
                        </td>
                        {allSubColumns.map((subCol: any) => (
                          <td key={`${subCol.columnId}-${subCol.id}-${row.id}`} className="border p-2 text-center">
                            <input
                              type="radio"
                              name={`row-${row.id || rowIndex}-${subCol.columnId}`}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
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
            <div className="flex items-center">
              <h3 className="text-lg font-medium">
                {questionNumber}. {question.text}
              </h3>
              {question.required && <span className="text-red-500 ml-2 font-semibold">* 필수</span>}
            </div>
            <div className="mt-2">
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder={teProps.placeholder || '답변을 입력하세요'}
                disabled
              />
              {teProps.maxLength && (
                <p className="mt-1 text-xs text-gray-500">
                  최대 {teProps.maxLength}자까지 입력 가능
                </p>
              )}
            </div>
          </div>
        );
      }
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">설문지 미리보기</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handleSaveClick}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  저장하기
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="닫기"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {questions?.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <p className="text-lg">추가된 질문이 없습니다.</p>
                  <p className="text-sm mt-2">왼쪽에서 질문을 추가해주세요.</p>
                </div>
              ) : (
                questions.map((question, index) => (
                  <div 
                    key={question.id} 
                    className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                  >
                    {renderQuestionPreview(question, index)}
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-base"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
      {renderSaveModal()}
    </>
  );
};
