'use client';

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { QuestionType, Question } from '../types';
import { MultipleChoiceEditor } from './components/MultipleChoiceEditor';
import { SideBySideEditor } from './components/SideBySideEditor';
import { TextEntryEditor } from './components/TextEntryEditor';
import { PreviewModal } from './components/PreviewModal';

// 기본 질문 데이터
const defaultQuestion: Question = {
  id: 'preview',
  type: QuestionType.MULTIPLE_CHOICE,
  text: '샘플 질문입니다. 여기에 질문 내용을 입력하세요.',
  required: false,
  options: [
    { id: '1', text: '옵션 1' },
    { id: '2', text: '옵션 2' },
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

export default function QualtricsStyleSurveyEditor() {
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question>(defaultQuestion);

  // 에디터 상태를 저장할 refs
  const multipleChoiceRef = useRef<{ getState: () => any }>(null);
  const sideBySideRef = useRef<{ getState: () => any }>(null);
  const textEntryRef = useRef<{ getState: () => any }>(null);

  const handlePreview = () => {
    let questionData: any = {
      type: selectedQuestionType,
    };

    // 현재 선택된 에디터의 상태를 가져옵니다.
    switch (selectedQuestionType) {
      case QuestionType.MULTIPLE_CHOICE: {
        const state = multipleChoiceRef.current?.getState();
        if (state) {
          questionData = {
            ...questionData,
            text: state.question || '샘플 질문입니다. 여기에 질문 내용을 입력하세요.',
            required: state.isRequired,
            options: state.options,
            optionCount: state.optionCount,
            props: {
              options: state.options,
              optionCount: state.optionCount,
            },
          };
        }
        break;
      }
      
      case QuestionType.SIDE_BY_SIDE: {
        const state = sideBySideRef.current?.getState();
        if (state) {
          questionData = {
            ...questionData,
            text: state.question || '샘플 질문입니다. 여기에 질문 내용을 입력하세요.',
            required: state.isRequired,
            optionCount: state.optionCount,
            columnCount: state.columnCount,
            props: {
              sideBySideOptions: state.sideBySideOptions,
              optionCount: state.optionCount,
              columnCount: state.columnCount,
              subColumnCounts: state.subColumnCounts,
              columns: state.columns, // 컬럼 데이터 전체 전달
            },
          };
        }
        break;
      }
      
      case QuestionType.TEXT_ENTRY: {
        const state = textEntryRef.current?.getState();
        if (state) {
          questionData = {
            ...questionData,
            text: state.question || '샘플 질문입니다. 여기에 질문 내용을 입력하세요.',
            required: state.isRequired,
            props: {
              maxLength: state.maxLength,
              placeholder: state.placeholder || '답변을 입력하세요',
            },
          };
        }
        break;
      }
    }

    setPreviewQuestion({
      ...defaultQuestion,
      ...questionData,
      type: selectedQuestionType,
    });
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
  };

  const renderEditor = () => {
    switch (selectedQuestionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return <MultipleChoiceEditor />;
      case QuestionType.SIDE_BY_SIDE:
        return <SideBySideEditor />;
      case QuestionType.TEXT_ENTRY:
        return <TextEntryEditor />;
      default:
        return <MultipleChoiceEditor />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">설문조사 편집기</h1>
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
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">질문 유형 선택</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedQuestionType(QuestionType.MULTIPLE_CHOICE)}
            className={`px-4 py-2 rounded-md ${
              selectedQuestionType === QuestionType.MULTIPLE_CHOICE
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            복수 선택
          </button>
          <button
            onClick={() => setSelectedQuestionType(QuestionType.SIDE_BY_SIDE)}
            className={`px-4 py-2 rounded-md ${
              selectedQuestionType === QuestionType.SIDE_BY_SIDE
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            병렬 비교
          </button>
          <button
            onClick={() => setSelectedQuestionType(QuestionType.TEXT_ENTRY)}
            className={`px-4 py-2 rounded-md ${
              selectedQuestionType === QuestionType.TEXT_ENTRY
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            텍스트 답변
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        {(() => {
        const editorProps = {
          ref: (ref: any) => {
            if (selectedQuestionType === QuestionType.MULTIPLE_CHOICE) {
              multipleChoiceRef.current = ref;
            } else if (selectedQuestionType === QuestionType.SIDE_BY_SIDE) {
              sideBySideRef.current = ref;
            } else if (selectedQuestionType === QuestionType.TEXT_ENTRY) {
              textEntryRef.current = ref;
            }
          }
        };
        
        return React.cloneElement(renderEditor(), editorProps);
      })()}
      </div>
      
      <PreviewModal 
        isOpen={isPreviewOpen} 
        onClose={closePreview} 
        question={previewQuestion} 
      />
    </div>
  );
}
