'use client';

import { useState, useEffect } from 'react';
import { QuestionType, Question, MultipleChoiceOption, SurveyEditorState, SurveyEditorProps } from '../types';

// 입력 필드의 border 스타일을 관리하는 유틸리티 함수
const getInputBorderClass = (previewMode: boolean) => {
  return 'border-blue-500';
};

export default function SurveyEditor({ onSave }: SurveyEditorProps) {
  // 컴포넌트 상태 관리
  const [state, setState] = useState<SurveyEditorState>({
    questions: [],
    selectedQuestionId: undefined,
    previewMode: false,
  });

  // 선택된 질문이 없을 때 자동으로 첫 번째 질문 선택
  useEffect(() => {
    if (state.questions.length > 0 && !state.selectedQuestionId) {
      setState(prev => ({
        ...prev,
        selectedQuestionId: state.questions[0].id
      }));
    }
  }, [state.questions]);

  // 초기 로드 시 복수 선택 항목 자동 추가
  useEffect(() => {
    if (state.questions.length === 0) {
      addQuestion('MULTIPLE_CHOICE');
    }
  }, []);

  // 미리보기 모달 상태 관리
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // 새로운 질문 추가 함수
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

  // 질문 텍스트 업데이트 함수
  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setState(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  // 선택항목 수 업데이트 함수
  const updateOptionCount = (questionId: string, count: number) => {
    const currentQuestion = state.questions.find(q => q.id === questionId);
    if (!currentQuestion) return;

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

  // 선택항목 텍스트 업데이트 함수
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

  // 미리보기 모달 열기 함수
  const togglePreview = () => {
    setIsPreviewModalOpen(true);
  };

  // 설문 저장 함수
  const handleSave = () => {
    if (onSave) {
      onSave(state.questions);
    }
  };

  return (
    <div className="flex h-screen">
      {/* 왼쪽 패널 */}
      <div className="w-1/4 p-4 border-r px-5">
        <div className="mb-4">
          <label className="block mb-2">질문 유형</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const type = e.target.value as QuestionType;
              
              // 기존 질문이 있으면 삭제하고 새로운 질문 추가
              if (state.selectedQuestionId) {
                setState(prev => ({
                  ...prev,
                  questions: prev.questions.filter(q => q.id !== state.selectedQuestionId),
                  selectedQuestionId: undefined
                }));
              }
              
              addQuestion(type);
            }}
          >
            <option value="MULTIPLE_CHOICE">복수 선택 항목</option>
            <option value="TEXT_ENTRY">텍스트 엔트리</option>
          </select>
        </div>

        {/* 선택항목 수 (복수 선택 항목에서만 표시) */}
        {state.selectedQuestionId && state.questions.find(q => q.id === state.selectedQuestionId)?.type === 'MULTIPLE_CHOICE' && (
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
        )}

      </div>

      {/* 중앙 패널 */}
      <div className="flex-1 p-4 pl-6">
        {state.questions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">질문을 추가해주세요.</p>
          </div>
        ) : (
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
                  <div className="mb-1">
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
                      <div key={opt.id} className="flex items-center p-1">
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
                <div className="mt-1">
                  <input
                    type="text"
                    className={`w-full p-2 ${getInputBorderClass(false)}`}
                    placeholder="답변을 입력해주세요."
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 미리보기 모달 */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">설문조사 미리보기</h2>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>

            <div className="space-y-6">
              {state.questions.map((q) => (
                <div key={q.id} className="border-b pb-6 last:border-0">
                  <div className="font-semibold mb-4">{q.text}</div>
                  {q.type === 'MULTIPLE_CHOICE' ? (
                    <div className="space-y-3">
                      {q.options?.map((opt) => (
                        <label key={opt.id} className="flex items-center">
                          <input
                            type="radio"
                            name={`preview_${q.id}`}
                            className="mr-3"
                          />
                          <span className="text-gray-700">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <input
                        type="text"
                        className="w-full p-3 border rounded-lg"
                        placeholder="답변을 입력해주세요."
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
