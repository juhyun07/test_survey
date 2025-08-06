import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface Option {
  id: string;
  text: string;
}

interface MultipleChoiceEditorProps {
  question?: string;
  isRequired?: boolean;
  options?: Array<{ id: string; text: string }>;
  optionCount?: number;
  onQuestionChange?: (text: string) => void;
  onRequiredChange?: (required: boolean) => void;
  onOptionsChange?: (options: Array<{ id: string; text: string }>) => void;
  onOptionCountChange?: (count: number) => void;
}

interface MultipleChoiceEditorRef {
  getState: () => {
    options: { id: string; text: string }[];
    optionCount: number;
    question: string;
    isRequired: boolean;
  };
}

export const MultipleChoiceEditor = forwardRef<MultipleChoiceEditorRef, MultipleChoiceEditorProps>(({ question: initialQuestion = '', isRequired: initialIsRequired = false, options: initialOptions = [], onQuestionChange, onRequiredChange, onOptionsChange, onOptionCountChange }, ref) => {
  MultipleChoiceEditor.displayName = 'MultipleChoiceEditor';
  const [options, setOptions] = useState<Option[]>(
    initialOptions.length > 0 
      ? initialOptions 
      : [
          { id: '1', text: '옵션 1' },
          { id: '2', text: '옵션 2' },
        ]
  );
  const [optionCount, setOptionCount] = useState(2);
  const [question, setQuestion] = useState<string>(initialQuestion);
  const [isRequired, setIsRequired] = useState<boolean>(initialIsRequired);

  useImperativeHandle(ref, () => ({
    getState: () => ({
      options,
      optionCount,
      question,
      isRequired,
    }),
  }));

  const addOption = () => {
    const newId = (options.length + 1).toString();
    const newOptions = [...options, { id: newId, text: `옵션 ${newId}` }];
    setOptions(newOptions);
    setOptionCount(newOptions.length);
    onOptionsChange?.(newOptions);
    onOptionCountChange?.(newOptions.length);
  };

  const updateOption = (id: string, text: string) => {
    const newOptions = options.map(option => 
      option.id === id ? { ...option, text } : option
    );
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
  };

  const removeOption = (id: string) => {
    const newOptions = options.filter(option => option.id !== id);
    setOptions(newOptions);
    setOptionCount(newOptions.length);
    onOptionsChange?.(newOptions);
    onOptionCountChange?.(newOptions.length);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            onQuestionChange?.(e.target.value);
          }}
          placeholder="질문을 입력하세요"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">선택 항목</label>
          <button
            onClick={addOption}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + 항목 추가
          </button>
        </div>
        
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                disabled
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <input
                type="text"
                className="ml-2 flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={option.text}
                onChange={(e) => updateOption(option.id, e.target.value)}
                placeholder="선택지"
              />
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          checked={isRequired}
          onChange={(e) => {
            setIsRequired(e.target.checked);
            onRequiredChange?.(e.target.checked);
          }}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
          필수 질문
        </label>
      </div>
    </div>
  );
});
