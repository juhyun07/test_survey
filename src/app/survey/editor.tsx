'use client';

import { useState, useEffect, useRef } from 'react';
import { QuestionType, Question, MultipleChoiceOption, SurveyEditorState, SurveyEditorProps } from './types';

const getInputBorderClass = (previewMode: boolean) => {
  return previewMode ? 'border-gray-300 focus:border-blue-500' : 'border-blue-500';
};

export default function SurveyEditor({ onSave }: SurveyEditorProps) {
  const [state, setState] = useState<SurveyEditorState>({
    questions: [],
    selectedQuestionId: undefined,
    previewMode: false,
  });

  useEffect(() => {
    if (state.questions.length > 0 && !state.selectedQuestionId) {
      setState(prev => ({
        ...prev,
        selectedQuestionId: state.questions[0].id
      }));
    }
  }, [state.questions]);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type,
      text: '',
      options: type === 'MULTIPLE_CHOICE' ? [{ id: `opt${Date.now()}`, text: '' }] : undefined,
      optionCount: type === 'MULTIPLE_CHOICE' ? 1 : 0
    };
    setState(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
      selectedQuestionId: newQuestion.id
    }));
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const updateOptionCount = (questionId: string, count: number) => {
    const currentQuestion = state.questions.find(q => q.id === questionId);
    if (!currentQuestion) return;

    // 기존 옵션들의 텍스트를 보존
    const existingOptions = currentQuestion.options || [];
    const newOptions = Array.from({ length: Math.max(1, Math.min(5, count)) }, (_, i) => {
      const existingOption = existingOptions[i];
      return {
        id: `opt${questionId}_${i}`,
        text: existingOption?.text || ''
      };
    });

    setState(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId 
          ? { 
              ...q, 
              optionCount: Math.max(1, Math.min(5, count)),
              options: newOptions
            } 
          : q
      )
    }));
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? {
          ...q,
          options: q.options?.map(opt => 
            opt.id === optionId ? { ...opt, text } : opt
          )
        } : q
      ),
    }));
  };

  const togglePreview = () => {
    setState(prev => ({
      ...prev,
      previewMode: !prev.previewMode,
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(state.questions);
    }
  };

  return (
    <div className="flex h-screen">
      {/* 왼쪽 패널 */}
      <div className="w-1/4 p-4 border-r">
        <div className="mb-4">
          <label className="block mb-2">질문 유형</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => addQuestion(e.target.value as QuestionType)}
          >
            <option value="MULTIPLE_CHOICE">복수 선택 항목</option>
            <option value="TEXT_ENTRY">텍스트 엔트리</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2">선택항목 수</label>
          <div className="flex items-center">
            <button
              onClick={() => updateOptionCount(state.selectedQuestionId!, state.questions.find(q => q.id === state.selectedQuestionId)?.optionCount! - 1)}
              className="bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
            >
              -
            </button>
            <input
              type="text"
              className="w-12 text-center mx-2 border-gray-300 rounded"
              value={state.questions.find(q => q.id === state.selectedQuestionId)?.optionCount || ''}
              onChange={(e) => {
                const value = e.target.value;
                const num = parseInt(value);
                if (!isNaN(num) || value == '') {
                  updateOptionCount(state.selectedQuestionId!, Math.max(1, Math.min(5, num)));
                  e.target.value = '';
                }
              }}
              onBlur={(e) => {
                const value = e.currentTarget.value;
                if (value === '') {
                  updateOptionCount(state.selectedQuestionId!, 1);
                }
              }}
            />
            <button
              onClick={() => updateOptionCount(state.selectedQuestionId!, state.questions.find(q => q.id === state.selectedQuestionId)?.optionCount! + 1)}
              className="bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* 중앙 패널 */}
      <div className="flex-1 p-4">
        {state.selectedQuestionId && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-end gap-1">
              <button
                onClick={togglePreview}
                className="bg-white text-blue-500 border-blue-500 border-2 px-2 py-1 rounded hover:bg-blue-50 hover:border-blue-600 transition-colors"
              >
                미리보기
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                저장하기
              </button>
            </div>

            <div className="flex-1">
              <div className="space-y-1">
                <div className="flex flex-col gap-1">
                  <div>
                    <input
                      type="text"
                      className={`w-20 p-2 ${getInputBorderClass(false)}`}
                      placeholder="Q1"
                      value={state.questions.find(q => q.id === state.selectedQuestionId)?.exportTag || ''}
                      onChange={(e) => updateQuestion(state.selectedQuestionId!, { exportTag: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      className={`w-full p-2 ${getInputBorderClass(false)}`}
                      placeholder="질문을 적어주세요."
                      value={state.questions.find(q => q.id === state.selectedQuestionId)?.text || ''}
                      onChange={(e) => updateQuestion(state.selectedQuestionId!, { text: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {state.questions.find(q => q.id === state.selectedQuestionId)?.type === 'MULTIPLE_CHOICE' ? (
                <div className="space-y-4">

                  <div className="space-y-2">
                    {state.questions.find(q => q.id === state.selectedQuestionId)?.options?.map((opt) => (
                      <div key={opt.id} className="flex items-center p-2">
                        <input
                          type="radio"
                          name={`question_${state.selectedQuestionId}`}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          className={`flex-1 ${getInputBorderClass(false)}`}
                          placeholder="선택항목을 작성해주세요."
                          value={opt.text}
                          onChange={(e) => updateOption(state.selectedQuestionId!, opt.id, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    className={`w-full p-2 ${getInputBorderClass(false)}`}
                    placeholder="질문을 적어주세요."
                    value={state.questions.find(q => q.id === state.selectedQuestionId)?.text || ''}
                    onChange={(e) => updateQuestion(state.selectedQuestionId!, { text: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* 미리보기 모달 */}
            {isPreviewModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">미리보기</h2>
                    <button
                      onClick={() => setIsPreviewModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      X
                    </button>
                  </div>

                  <div className="space-y-4">
                    {state.questions.map((q) => (
                      <div key={q.id}>
                        <div className="font-semibold mb-2">{q.text}</div>
                        {q.type === 'MULTIPLE_CHOICE' && (
                          <div className="space-y-2">
                            {q.options?.map((opt) => (
                              <div key={opt.id} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`preview_${q.id}`}
                                  className="mr-2"
                                />
                                <span>{opt.text}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
