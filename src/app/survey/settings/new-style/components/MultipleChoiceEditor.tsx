import React, { useState } from 'react';

export const MultipleChoiceEditor: React.FC = () => {
  const [options, setOptions] = useState<string[]>([""]);
  const [question, setQuestion] = useState<string>("");
  const [isRequired, setIsRequired] = useState<boolean>(false);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 1) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">질문</label>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
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
          {options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                disabled
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <input
                type="text"
                className="ml-2 flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`선택지 ${index + 1}`}
              />
              {options.length > 1 && (
                <button
                  onClick={() => removeOption(index)}
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
          onChange={(e) => setIsRequired(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
          필수 질문
        </label>
      </div>
    </div>
  );
};
