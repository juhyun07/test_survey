import { SurveyPageProps, SurveyPageState } from "./types";
import { useState } from 'react';

export default function SurveyPage1({ onNext, onAnswerChange }: SurveyPageProps & { onAnswerChange: (page: string, answers: SurveyPageState) => void }) {
  const [state, setState] = useState<SurveyPageState>({
    answer1: "",
    answer2: ""
  });

  const handleNext = () => {
    if (!state.answer1 || !state.answer2) {
      alert("답변을 모두 입력해주세요");
      return;
    }
    onAnswerChange('page1', state);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">1. 이 설문조사는 몇 번째 페이지인가요?</h3>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="답변을 입력하세요"
          value={state.answer1}
          onChange={(e) => setState({ ...state, answer1: e.target.value })}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">2. 이 페이지의 질문은 몇 개인가요?</h3>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="답변을 입력하세요"
          value={state.answer2}
          onChange={(e) => setState({ ...state, answer2: e.target.value })}
        />
      </div>
      <button
        onClick={handleNext}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 float-right"
      >
        다음
      </button>
    </div>
  );
}
