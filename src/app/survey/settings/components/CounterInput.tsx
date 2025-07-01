import React from 'react';

interface CounterInputProps {
  value: number;
  minValue: number;
  maxValue: number;
  onChange: (value: number) => void;
  label: string;
}

export const CounterInput: React.FC<CounterInputProps> = ({
  value,
  minValue,
  maxValue,
  onChange,
  label,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(value);
    if (!isNaN(numValue) || value === '') {
        console.log(numValue);
      onChange(Math.max(minValue, Math.min(maxValue, numValue)));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (value === '0') {
      onChange(minValue);
    }
  };

  return (
    <div>
      <label className="block mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onChange(Math.max(minValue, value - 1))}
          className="bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
        >
          -
        </button>
        <input
          type="text"
          className="w-12 text-center mx-2 border border-gray-300 rounded"
          value={value || 0}
          onChange={handleInputChange}
          onBlur={handleBlur}
        />
        <button
          onClick={() => onChange(Math.min(maxValue, value + 1))}
          className="bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
        >
          +
        </button>
      </div>
    </div>
  );
};
