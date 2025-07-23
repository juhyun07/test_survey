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
      const sideBySideOption: SideBySideOption = {
        id: '1',
        text: '항목 1',
        descriptionCount: 0,
        columns: [{
          title: '기본',
          answers: [{ id: '1', text: '옵션 1' }]
        }]
      };
      
      return {
        ...baseQuestion,
        optionCount: 2,
        columnCount: 2,
        props: {
          sideBySideOptions: [
            { ...sideBySideOption, id: '1', text: '항목 1' },
            { ...sideBySideOption, id: '2', text: '항목 2' },
          ],
          columns: [
            {
              id: 'col1',
              label: '열 1',
              subColumns: [
                { id: 'sub1', label: '옵션 1' },
                { id: 'sub2', label: '옵션 2' },
              ],
            },
          ],
          optionCount: 2,
          columnCount: 2,
          subColumnCounts: [2],
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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 에디터 상태를 저장할 refs
  const multipleChoiceRef = useRef<{ getState: () => any }>(null);
  const sideBySideRef = useRef<{ getState: () => any }>(null);
  const textEntryRef = useRef<{ getState: () => any }>(null);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = createNewQuestion(type);
    setQuestions([...questions, newQuestion]);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!editingQuestion) return;

    const state = getCurrentEditorState(editingQuestion.type);
    if (!state) return;

    const updatedQuestion = createQuestionFromState(editingQuestion.type, state);
    
    setQuestions(questions.map(q => 
      q.id === editingQuestion.id ? { ...updatedQuestion, id: editingQuestion.id } : q
    ));
    
    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const getCurrentEditorState = (type: QuestionType) => {
    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return multipleChoiceRef.current?.getState();
      case QuestionType.SIDE_BY_SIDE:
        return sideBySideRef.current?.getState();
      case QuestionType.TEXT_ENTRY:
        return textEntryRef.current?.getState();
      default:
        return null;
    }
  };

  const createQuestionFromState = (type: QuestionType, state: any): Question => {
    const baseQuestion = {
      id: editingQuestion?.id || uuidv4(),
      type,
      text: state.question || '새 질문',
      required: state.isRequired || false,
      props: {},
    };

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        return {
          ...baseQuestion,
          options: state.options || [],
          optionCount: state.optionCount || 0,
          props: {
            options: state.options || [],
            optionCount: state.optionCount || 0,
          },
        };
      case QuestionType.SIDE_BY_SIDE:
        return {
          ...baseQuestion,
          optionCount: state.optionCount || 0,
          columnCount: state.columnCount || 0,
          props: {
            sideBySideOptions: state.sideBySideOptions || [],
            columns: state.columns || [],
            optionCount: state.optionCount || 0,
            columnCount: state.columnCount || 0,
            subColumnCounts: state.subColumnCounts || [],
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
    const editorProps = {
      ref: (ref: any) => {
        if (question.type === QuestionType.MULTIPLE_CHOICE) {
          multipleChoiceRef.current = ref;
        } else if (question.type === QuestionType.SIDE_BY_SIDE) {
          sideBySideRef.current = ref;
        } else if (question.type === QuestionType.TEXT_ENTRY) {
          textEntryRef.current = ref;
        }
      },
      ...(question.props || {})
    };

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return <MultipleChoiceEditor {...editorProps} />;
      case QuestionType.SIDE_BY_SIDE:
        return <SideBySideEditor {...editorProps} />;
      case QuestionType.TEXT_ENTRY:
        return <TextEntryEditor {...editorProps} />;
      default:
        return <div>지원하지 않는 질문 유형입니다.</div>;
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

      {/* 질문 목록 */}
      <div className="space-y-4 mb-6">
        {questions.map((question, index) => (
          <div 
            key={question.id} 
            className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-blue-500 cursor-pointer"
            onClick={() => handleEditQuestion(question)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium">{question.text || `질문 ${index + 1}`}</h3>
              <span className="text-sm text-gray-500">
                {question.type === QuestionType.MULTIPLE_CHOICE && '복수 선택'}
                {question.type === QuestionType.CHECKBOX && '체크박스'}
                {question.type === QuestionType.SIDE_BY_SIDE && '병렬 비교'}
                {question.type === QuestionType.TEXT_ENTRY && '텍스트 답변'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 질문 추가 버튼 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">질문 추가</label>
        <div className="flex space-x-4">
          <button
            onClick={() => handleAddQuestion(QuestionType.MULTIPLE_CHOICE)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            복수 선택 추가
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.SIDE_BY_SIDE)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            병렬 비교 추가
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.TEXT_ENTRY)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            텍스트 답변 추가
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.CHECKBOX)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            체크박스 추가
          </button>
        </div>
      </div>

      {/* 질문 편집 모달 */}
      {isQuestionModalOpen && editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingQuestion.type === QuestionType.MULTIPLE_CHOICE && '복수 선택'}
                {editingQuestion.type === QuestionType.CHECKBOX && '체크박스'}
                {editingQuestion.type === QuestionType.SIDE_BY_SIDE && '병렬 비교'}
                {editingQuestion.type === QuestionType.TEXT_ENTRY && '텍스트 답변'}
                {' '}질문 편집
              </h2>
              
              <div className="bg-white p-6 rounded-lg shadow mb-4">
                {renderEditor(editingQuestion)}
              </div>
              
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setIsQuestionModalOpen(false);
                    setEditingQuestion(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 미리보기 모달 */}
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={closePreview} 
        questions={questions} 
      />
    </div>
  );
}
