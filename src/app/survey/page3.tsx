import { SurveyCompleteProps, SurveyPageState3, SurveyPageProps } from "./types";
import { useState } from 'react';

export default function SurveyPage3({ onNext, onAnswerChange, onComplete }: SurveyPageProps & { onAnswerChange: (page: string, answers: SurveyPageState3) => void } & SurveyCompleteProps) {
  const [state, setState] = useState<SurveyPageState3>({
    answer1: "",
    answer2: ""
  });

  const handleComplete = () => {
    if (!state.answer1 || !state.answer2) {
      alert("답변을 모두 입력해주세요");
      return;
    }
    onAnswerChange('page3', state);
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">5. 이 설문조사는 몇 페이지로 구성되어 있나요?</h3>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="답변을 입력하세요"
          value={state.answer1}
          onChange={(e) => setState({ ...state, answer1: e.target.value })}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">6. 이 페이지는 마지막 페이지인가요?</h3>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="답변을 입력하세요"
          value={state.answer2}
          onChange={(e) => setState({ ...state, answer2: e.target.value })}
        />
      </div>
      <button
        onClick={handleComplete}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 float-right"
      >
        완료
      </button>
    </div>
  );
}
