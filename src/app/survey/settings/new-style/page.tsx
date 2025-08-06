'use client';

import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';


import { Question, QuestionType, SavedSurvey } from '../types';
import { MultipleChoiceEditor } from './components/MultipleChoiceEditor';
import { CheckBoxEditor } from './components/CheckBoxEditor';
import { SideBySideEditor } from './components/SideBySideEditor';
import { TextEntryEditor } from './components/TextEntryEditor';
import { PreviewModal } from './components/PreviewModal';

type EditorQuestion = Question & { isExpanded?: boolean };

// 기본 질문 데이터
const createNewQuestion = (type: QuestionType): EditorQuestion => {
  const id = uuidv4();
  const baseQuestion = {
    id,
    text: '새 질문',
    isRequired: false,
  };

  switch (type) {
    case QuestionType.CHECKBOX:
      return {
        ...baseQuestion,
        type: QuestionType.CHECKBOX,
        props: {
          options: [
            { id: uuidv4(), text: '옵션 1' },
            { id: uuidv4(), text: '옵션 2' },
          ],
        },
      };
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      return {
        ...baseQuestion,
        type: QuestionType.MULTIPLE_CHOICE_MULTIPLE,
        props: {
          options: [
            { id: uuidv4(), text: '옵션 1' },
            { id: uuidv4(), text: '옵션 2' },
          ],
          optionCount: 2,
        },
      };
    case QuestionType.MULTIPLE_CHOICE:
      return {
        ...baseQuestion,
        type: QuestionType.MULTIPLE_CHOICE,
        props: {
          options: [
            { id: uuidv4(), text: '옵션 1' },
            { id: uuidv4(), text: '옵션 2' },
          ],
          optionCount: 2,
        },
      };
    case QuestionType.SIDE_BY_SIDE:
      return {
        ...baseQuestion,
        type: QuestionType.SIDE_BY_SIDE,
        props: {
          rows: [
            { id: uuidv4(), text: '항목 1' },
            { id: uuidv4(), text: '항목 2' },
          ],
          columns: [
            {
              id: uuidv4(),
              text: '열 1',
              subColumns: [{ id: uuidv4(), label: '하위 열 1-1' }],
            },
            {
              id: uuidv4(),
              text: '열 2',
              subColumns: [{ id: uuidv4(), label: '하위 열 2-1' }],
            },
          ],
          optionCount: 2,
          columnCount: 2,
          subColumnCounts: [1, 1],
        },
      };
    case QuestionType.TEXT_ENTRY:
      return {
        ...baseQuestion,
        type: QuestionType.TEXT_ENTRY,
        props: {
          maxLength: 100,
          placeholder: '답변을 입력하세요',
          isLongText: false,
        },
      };
    default:
      // Exhaustive check
      const _exhaustiveCheck: never = type;
      throw new Error(`Unhandled question type: ${_exhaustiveCheck}`);
  }
};

export default function QualtricsStyleSurveyEditor() {
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // 질문 펼침/접기 상태 토글
  const toggleQuestionExpansion = (index: number) => {
    setQuestions(prev => 
      prev.map((q, i) => 
        i === index ? { ...q, isExpanded: !q.isExpanded } : q
      )
    );
  };

  // 설문지 저장 처리
  const handleSaveSurvey = (surveyData: Omit<SavedSurvey, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSurvey: SavedSurvey = {
      ...surveyData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 기존 설문지 목록 가져오기
    const savedSurveys = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
    
    // 새 설문지 추가
    const updatedSurveys = [...savedSurveys, newSurvey];
    
    // 로컬 스토리지에 저장
    localStorage.setItem('savedSurveys', JSON.stringify(updatedSurveys));
    
    alert('설문지가 성공적으로 저장되었습니다.');
  };

  // 질문 업데이트 핸들러
  const handleUpdateQuestion = (
    questionId: string,
    updates: Partial<EditorQuestion>
  ) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, ...updates } as EditorQuestion : q))
    );
  };

  // 에디터 상태를 저장할 refs
  const multipleChoiceRef = useRef<{ getState: () => Question['props'] }>(null);
  const sideBySideRef = useRef<{ getState: () => Question['props'] }>(null);
  const textEntryRef = useRef<{ getState: () => Question['props'] }>(null);
  const checkBoxRef = useRef<{ getState: () => Question['props'] }>(null);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = createNewQuestion(type);
    newQuestion.isExpanded = true;
    newQuestion.id = Date.now().toString();
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };





  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const renderEditor = (question: EditorQuestion) => {
    const commonProps = {
      ref: (ref: { getState: () => Question['props'] } | null) => {
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
          case QuestionType.CHECKBOX:
            checkBoxRef.current = ref;
            break;
        }
      },
      question: question.text,
      isRequired: question.isRequired,
    };

    switch (question.type) {
      case QuestionType.CHECKBOX:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        if (question.type === QuestionType.CHECKBOX) {
          return <CheckBoxEditor {...commonProps}
            options={question.props.options || []}
            onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
            onRequiredChange={(isRequired) => handleUpdateQuestion(question.id, { isRequired })}
            onOptionsChange={(options) => handleUpdateQuestion(question.id, { props: { ...question.props, options } })} />;
        } else {
          return <MultipleChoiceEditor {...commonProps}
            options={question.props.options || []}
            onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
            onRequiredChange={(isRequired) => handleUpdateQuestion(question.id, { isRequired })}
            onOptionsChange={(options) => handleUpdateQuestion(question.id, { props: { ...question.props, options, optionCount: options.length } })} />;
        }
        break;
      case QuestionType.SIDE_BY_SIDE:
        if (question.type === QuestionType.SIDE_BY_SIDE) {
            return <SideBySideEditor {...commonProps} 
              rows={(question.props.rows || []).map(r => ({ id: r.id, label: r.text }))} 
              columns={(question.props.columns || []).map(c => ({ ...c, label: c.text }))} 
              onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
              onRequiredChange={(isRequired) => handleUpdateQuestion(question.id, { isRequired })}
              onRowsChange={(rows) => handleUpdateQuestion(question.id, { props: { ...question.props, rows: rows.map(r => ({ id: r.id, text: r.label })) } })}
              onColumnsChange={(columns) => handleUpdateQuestion(question.id, { props: { ...question.props, columns: columns.map(c => ({ ...c, text: c.label })), columnCount: columns.length, subColumnCounts: columns.map(c => c.subColumns.length) } })}
            />;
        }
        break;
      case QuestionType.TEXT_ENTRY:
        if (question.type === QuestionType.TEXT_ENTRY) {
            return <TextEntryEditor {...commonProps} 
              maxLength={question.props.maxLength || undefined} 
              placeholder={question.props.placeholder || ''} 
              isLongText={question.props.isLongText || false}
              onQuestionChange={(text) => handleUpdateQuestion(question.id, { text })}
              onRequiredChange={(isRequired) => handleUpdateQuestion(question.id, { isRequired })}
              onMaxLengthChange={(maxLength) => handleUpdateQuestion(question.id, { props: { ...question.props, maxLength } })}
              onPlaceholderChange={(placeholder) => handleUpdateQuestion(question.id, { props: { ...question.props, placeholder } })}
              onIsLongTextChange={(isLongText) => handleUpdateQuestion(question.id, { props: { ...question.props, isLongText } })}
            />;
        }
        break;
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
              onClick={() => handleAddQuestion(QuestionType.CHECKBOX)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600 text-sm"
            >
              복수 선택
            </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.MULTIPLE_CHOICE)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            단일 선택
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
                  ({question.type === QuestionType.MULTIPLE_CHOICE && '단일 선택'}
                  {question.type === QuestionType.SIDE_BY_SIDE && '병렬 비교'}
                  {question.type === QuestionType.TEXT_ENTRY && '텍스트 답변'}
                  {question.type === QuestionType.CHECKBOX && '복수 선택'}
                  )
                </span>
                {question.isRequired && (
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
        onSave={handleSaveSurvey}
      />
    </div>
  );
}
