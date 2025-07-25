import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface TextEntryEditorProps {
  question?: string;
  isRequired?: boolean;
  maxLength?: number;
  placeholder?: string;
  onQuestionChange?: (text: string) => void;
  onRequiredChange?: (required: boolean) => void;
  onMaxLengthChange?: (maxLength: number | undefined) => void;
  onPlaceholderChange?: (placeholder: string | undefined) => void;
}

interface TextEntryEditorRef {
  getState: () => {
    question: string;
    placeholder: string;
    isRequired: boolean;
    maxLength: number;
  };
}

export const TextEntryEditor = forwardRef<TextEntryEditorRef, TextEntryEditorProps>(({
  question: initialQuestion = '',
  isRequired: initialIsRequired = false,
  maxLength: initialMaxLength,
  placeholder: initialPlaceholder,
  onQuestionChange,
  onRequiredChange,
  onMaxLengthChange,
  onPlaceholderChange,
}, ref) => {
  const [question, setQuestion] = useState<string>(initialQuestion);
  const [isRequired, setIsRequired] = useState<boolean>(initialIsRequired);
  const [maxLength, setMaxLength] = useState<number | undefined>(initialMaxLength);
  const [placeholder, setPlaceholder] = useState<string | undefined>(initialPlaceholder);
  const [isLongText, setIsLongText] = useState<boolean>(false);

  useEffect(() => {
    setQuestion(initialQuestion);
    setIsRequired(initialIsRequired);
    setMaxLength(initialMaxLength);
    setPlaceholder(initialPlaceholder);
  }, [initialQuestion, initialIsRequired, initialMaxLength, initialPlaceholder]);

  useImperativeHandle(ref, () => ({
    getState: () => ({
      question,
      placeholder: placeholder || '',
      isRequired,
      maxLength: maxLength || 100,
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={question}
          onChange={(e) => {
            const newValue = e.target.value;
            setQuestion(newValue);
            onQuestionChange?.(newValue);
          }}
          placeholder="질문을 입력하세요"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          안내 텍스트 (선택사항)
        </label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={placeholder || ''}
          onChange={(e) => {
            const newValue = e.target.value || undefined;
            setPlaceholder(newValue);
            onPlaceholderChange?.(newValue);
          }}
          placeholder="예: 100자 이내로 입력해주세요"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="longText"
            checked={isLongText}
            onChange={(e) => setIsLongText(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="longText" className="ml-2 block text-sm text-gray-700">
            긴 텍스트 (여러 줄 입력)
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={isRequired}
            onChange={(e) => {
              const newValue = e.target.checked;
              setIsRequired(newValue);
              onRequiredChange?.(newValue);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
            필수 질문
          </label>
        </div>

        <div className="flex items-center">
          <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 mr-2">
            최대 글자수:
          </label>
          <input
            type="number"
            id="maxLength"
            min="1"
            max="10000"
            value={maxLength || ''}
            onChange={(e) => {
              const newValue = e.target.value ? parseInt(e.target.value) : undefined;
              setMaxLength(newValue);
              onMaxLengthChange?.(newValue);
            }}
            className="w-24 p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mt-4 border border-gray-200 rounded-md p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">미리보기</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {question || '질문 미리보기'}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          {isLongText ? (
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder={placeholder || '답변을 입력하세요'}
              maxLength={maxLength}
            />
          ) : (
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder || '답변을 입력하세요'}
              maxLength={maxLength}
            />
          )}
          <p className="mt-1 text-xs text-gray-500 text-right">
            {maxLength}자 이내
          </p>
        </div>
      </div>
    </div>
  );
});
