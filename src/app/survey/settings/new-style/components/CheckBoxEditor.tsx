import React, { useState, useImperativeHandle, forwardRef } from 'react';

interface Option {
  id: string;
  text: string;
  children?: Option[];
}

interface CheckBoxEditorProps {
  question?: string;
  isRequired?: boolean;
  options?: Option[];
  optionCount?: number;
  onQuestionChange?: (text: string) => void;
  onRequiredChange?: (required: boolean) => void;
  onOptionsChange?: (options: Option[]) => void;
  onOptionCountChange?: (count: number) => void;
}

interface CheckBoxEditorRef {
  getState: () => {
    options: Option[];
    optionCount: number;
    question: string;
    isRequired: boolean;
  };
}

// Helper to generate a unique ID
const generateUniqueId = () => `option_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const CheckBoxEditor = forwardRef<CheckBoxEditorRef, CheckBoxEditorProps>(({ question: initialQuestion = '', isRequired: initialIsRequired = false, options: initialOptions = [], onQuestionChange, onRequiredChange, onOptionsChange, onOptionCountChange }, ref) => {

  // displayName 설정
  CheckBoxEditor.displayName = 'CheckBoxEditor';
  const [options, setOptions] = useState<Option[]>(
    initialOptions.length > 0 
      ? initialOptions 
      : [
          { id: generateUniqueId(), text: '옵션 1' },
          { id: generateUniqueId(), text: '옵션 2' },
        ]
  );
  const [question, setQuestion] = useState<string>(initialQuestion);
  const [isRequired, setIsRequired] = useState<boolean>(initialIsRequired);

  const countOptions = (options: Option[]): number => {
    return options.reduce((acc, option) => {
      return 1 + (option.children ? countOptions(option.children) : 0);
    }, 0);
  };

  useImperativeHandle(ref, () => ({
    getState: () => ({
      options,
      optionCount: countOptions(options),
      question,
      isRequired,
    }),
  }));

  const updateStateAndNotify = (newOptions: Option[]) => {
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
    const newCount = countOptions(newOptions);
    onOptionCountChange?.(newCount);
  };

  const addOption = () => {
    const newId = generateUniqueId();
    const newOptions = [...options, { id: newId, text: `옵션 ${options.length + 1}` }];
    updateStateAndNotify(newOptions);
  };

  const updateOptionTextRecursive = (options: Option[], id: string, text: string): Option[] => {
    return options.map(option => {
      if (option.id === id) {
        return { ...option, text };
      }
      if (option.children) {
        return { ...option, children: updateOptionTextRecursive(option.children, id, text) };
      }
      return option;
    });
  };

  const updateOption = (id: string, text: string) => {
    const newOptions = updateOptionTextRecursive(options, id, text);
    updateStateAndNotify(newOptions);
  };

  const removeOptionRecursive = (options: Option[], id: string): Option[] => {
    const newOptions = options.filter(option => option.id !== id);
    return newOptions.map(option => {
      if (option.children) {
        return { ...option, children: removeOptionRecursive(option.children, id) };
      }
      return option;
    });
  };

  const removeOption = (id: string) => {
    const newOptions = removeOptionRecursive(options, id);
    updateStateAndNotify(newOptions);
  };

  const addSubOptionRecursive = (options: Option[], parentId: string): Option[] => {
    return options.map(option => {
      if (option.id === parentId) {
        const newSubOption = { id: generateUniqueId(), text: '하위 옵션' };
        const children = option.children ? [...option.children, newSubOption] : [newSubOption];
        return { ...option, children };
      }
      if (option.children) {
        return { ...option, children: addSubOptionRecursive(option.children, parentId) };
      }
      return option;
    });
  };

  const addSubOption = (parentId: string) => {
    const newOptions = addSubOptionRecursive(options, parentId);
    updateStateAndNotify(newOptions);
  };

  const addOptionAfterRecursive = (options: Option[], siblingId: string): Option[] => {
    const newOptions: Option[] = [];
    let added = false;
    for (const option of options) {
      newOptions.push(option);
      if (option.id === siblingId) {
        const newSibling = { id: generateUniqueId(), text: '새 옵션' };
        newOptions.push(newSibling);
        added = true;
      }
    }

    if (added) return newOptions;

    return options.map(option => {
      if (option.children) {
        return { ...option, children: addOptionAfterRecursive(option.children, siblingId) };
      }
      return option;
    });
  };

  const addOptionAfter = (siblingId: string) => {
    const newOptions = addOptionAfterRecursive(options, siblingId);
    updateStateAndNotify(newOptions);
  };

  const renderOptions = (optionsToRender: Option[], level = 0) => {
    return optionsToRender.map(option => (
      <div key={option.id} className="space-y-2">
        <div className="flex items-center" style={{ marginLeft: `${level * 2}rem` }}>
          <input
            type="checkbox"
            disabled
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <input
            type="text"
            className="ml-2 flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={option.text}
            onChange={(e) => updateOption(option.id, e.target.value)}
            placeholder="선택지"
          />
          {level > 0 && (
            <button
              type="button"
              onClick={() => addOptionAfter(option.id)}
              className="ml-2 text-sm text-green-600 hover:text-green-800 whitespace-nowrap"
            >
              옵션 추가
            </button>
          )}
          <button
            type="button"
            onClick={() => addSubOption(option.id)}
            className="ml-2 text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap"
          >
            하위 추가
          </button>
          <button
            type="button"
            onClick={() => removeOption(option.id)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
        {option.children && renderOptions(option.children, level + 1)}
      </div>
    ));
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
          {renderOptions(options)}
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
