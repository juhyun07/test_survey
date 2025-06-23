import { SurveyPageProps, SurveyPageState2 } from "./types";
import { useState, useEffect } from 'react';

export default function SurveyPage2({ onNext, onAnswerChange }: SurveyPageProps & { onAnswerChange: (page: string, answers: SurveyPageState2) => void }) {
  const [state, setState] = useState<SurveyPageState2>({
    answer1: "",
    answer2: "",
    timeSpent: 0
  });

  useEffect(() => {
    let startTime = Date.now();
    let timer: NodeJS.Timeout;

    // 1초마다 timeSpent 업데이트
    timer = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      setState(prev => ({ ...prev, timeSpent }));
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleNext = () => {
    if (!state.answer1 || !state.answer2) {
      alert("답변을 모두 입력해주세요");
      return;
    }
    onAnswerChange('page2', { ...state, timeSpent: state.timeSpent });
    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">3. 이 페이지는 몇 번째 페이지인가요?</h3>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="답변을 입력하세요"
          value={state.answer1}
          onChange={(e) => setState({ ...state, answer1: e.target.value })}
        />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">4. 이 페이지의 질문은 몇 개인가요?</h3>
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
