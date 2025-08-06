'use client';

import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { 
  QuestionType, 
  Question
} from '../types';
import { MultipleChoiceEditor, MultipleChoiceEditorRef } from './components/MultipleChoiceEditor';
import { SideBySideEditor, SideBySideEditorRef } from './components/SideBySideEditor';
import { TextEntryEditor, TextEntryEditorRef } from './components/TextEntryEditor';
import { PreviewModal } from './components/PreviewModal';

// 기본 질문 데이터
const createNewQuestion = (type: QuestionType): Question => {
  const baseQuestion = {
    id: uuidv4(),
    text: '새 질문',
    isRequired: false,
  };

  switch (type) {
    case QuestionType.MULTIPLE_CHOICE:
      return {
        ...baseQuestion,
        type,
        props: { options: [{ id: uuidv4(), text: '옵션 1' }] },
      };
    case QuestionType.SIDE_BY_SIDE:
      return {
        ...baseQuestion,
        type,
        props: {
          rows: [{ id: uuidv4(), text: '항목 1' }],
          columns: [{ id: uuidv4(), text: '열 1', subColumns: [{ id: uuidv4(), label: '옵션 1' }] }],
        },
      };
    case QuestionType.TEXT_ENTRY:
      return {
        ...baseQuestion,
        type,
        props: { maxLength: 100, placeholder: '' },
      };
    default:
      // CHECKBOX or other types can be handled here
      throw new Error('Unsupported question type');
  }
};

const initialQuestions: Question[] = [
  {
    id: '1',
    type: QuestionType.MULTIPLE_CHOICE,
    text: '객관식 질문',
    isRequired: true,
    props: {
      options: [
        { id: 'opt1', text: '옵션 1' },
        { id: 'opt2', text: '옵션 2' },
      ],
    },
  },
  {
    id: '2',
    type: QuestionType.SIDE_BY_SIDE,
    text: '매트릭스 질문',
    isRequired: false,
    props: {
      rows: [
        { id: 'sbs1', text: '항목 1' },
        { id: 'sbs2', text: '항목 2' },
      ],
      columns: [
        { id: 'col1', text: '열 1', subColumns: [{ id: 'sub1-1', label: '옵션 1' }] },
        { id: 'col2', text: '열 2', subColumns: [{ id: 'sub2-1', label: '옵션 1' }] },
      ],
    },
  },
  {
    id: '3',
    type: QuestionType.TEXT_ENTRY,
    text: '주관식 질문',
    isRequired: true,
    props: {
      maxLength: 100,
      placeholder: '답변을 입력하세요...',
    },
  },
];

export default function QualtricsStyleSurveyEditor() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 에디터 상태를 저장할 refs
  const multipleChoiceRef = useRef<MultipleChoiceEditorRef>(null);
  const sideBySideRef = useRef<SideBySideEditorRef>(null);
  const textEntryRef = useRef<TextEntryEditorRef>(null);

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

  const createQuestionFromState = (type: QuestionType, state: NonNullable<ReturnType<typeof getCurrentEditorState>>): Question => {
    const baseQuestion = {
      id: editingQuestion?.id || uuidv4(),
      text: state.question,
      isRequired: state.isRequired,
    };

    switch (type) {
      case QuestionType.MULTIPLE_CHOICE:
        if ('options' in state) {
          return {
            ...baseQuestion,
            type,
            props: { options: state.options },
          };
        }
        break;
      case QuestionType.SIDE_BY_SIDE:
        if ('rows' in state && 'columns' in state) {
          return {
            ...baseQuestion,
            type,
            props: { rows: state.rows, columns: state.columns },
          };
        }
        break;
      case QuestionType.TEXT_ENTRY:
        if ('maxLength' in state) {
          return {
            ...baseQuestion,
            type,
            props: { maxLength: state.maxLength, placeholder: state.placeholder },
          };
        }
        break;
    }
    throw new Error('Invalid state for question type');
  };

  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const renderEditor = (question: Question) => {
    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <MultipleChoiceEditor
            ref={multipleChoiceRef}
            initialQuestion={question.text}
            initialIsRequired={question.isRequired}
            initialOptions={question.props.options}
          />
        );
      case QuestionType.SIDE_BY_SIDE:
        return (
          <SideBySideEditor
            ref={sideBySideRef}
            initialQuestion={question.text}
            initialIsRequired={question.isRequired}
            initialRows={question.props.rows}
            initialColumns={question.props.columns}
          />
        );
      case QuestionType.TEXT_ENTRY:
        return (
          <TextEntryEditor
            ref={textEntryRef}
            initialQuestion={question.text}
            initialIsRequired={question.isRequired}
            initialPlaceholder={question.props.placeholder}
            initialMaxLength={question.props.maxLength}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600"
          >
            복수 선택 추가
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.SIDE_BY_SIDE)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600"
          >
            병렬 비교 추가
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.TEXT_ENTRY)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600"
          >
            텍스트 답변 추가
          </button>
          <button
            onClick={() => handleAddQuestion(QuestionType.CHECKBOX)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-600"
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
