'use client';

import React, { useState } from 'react';
import { QuestionType } from '../types';
import { MultipleChoiceEditor } from './components/MultipleChoiceEditor';
import { SideBySideEditor } from './components/SideBySideEditor';
import { TextEntryEditor } from './components/TextEntryEditor';

export default function QualtricsStyleSurveyEditor() {
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>(QuestionType.MULTIPLE_CHOICE);

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
      <h1 className="text-2xl font-bold mb-6">설문조사 편집기</h1>
      
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
        {renderEditor()}
      </div>
    </div>
  );
}
