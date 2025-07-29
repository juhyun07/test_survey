'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SavedSurvey, Question, QuestionType } from '@/app/survey/settings/types';

interface SurveyResult {
  submissionId: string;
  surveyId: string;
  title: string;
  submittedAt: string;
  answers: Record<string, string[]>;
}

const AnswerDisplay = ({ question, answer }: { question: Question; answer: string[] }) => {
  if (!answer || answer.length === 0) {
    return <p className="text-gray-500 italic">답변 없음</p>;
  }

  const getOptionText = (optionId: string) => {
    const findOption = (options: any[]): any | undefined => {
      for (const option of options) {
        if (option.id === optionId) return option;
        if (option.children) {
          const found = findOption(option.children);
          if (found) return found;
        }
      }
      return undefined;
    };
    const option = findOption(question.options || []);
    return option ? option.text : '알 수 없는 옵션';
  };

  switch (question.type) {
    case QuestionType.CHECKBOX:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      return (
        <ul className="list-disc list-inside">
          {answer.map(optionId => (
            <li key={optionId} className="text-gray-800">{getOptionText(optionId)}</li>
          ))}
        </ul>
      );
    case QuestionType.TEXT_ENTRY:
      return <p className="text-gray-800 bg-gray-100 p-2 rounded">{answer[0]}</p>;
    
    case QuestionType.SIDE_BY_SIDE:
        // This is a simplified display. A more detailed implementation would be needed for a full side-by-side view.
        return <p className="text-gray-800">Side-by-Side 질문에 대한 답변이 제출되었습니다.</p>;

    default:
      return <p className="text-gray-500">결과를 표시할 수 없는 질문 유형입니다.</p>;
  }
};

export default function SurveyResultDetailPage() {
  const { submissionId } = useParams();
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [survey, setSurvey] = useState<SavedSurvey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!submissionId) return;

    try {
      const allResults: SurveyResult[] = JSON.parse(localStorage.getItem('surveyResults') || '[]');
      const currentResult = allResults.find(r => r.submissionId === submissionId);

      if (!currentResult) {
        setError('해당 설문 결과를 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }
      setResult(currentResult);

      const allSurveys: SavedSurvey[] = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
      const sourceSurvey = allSurveys.find(s => s.id === currentResult.surveyId);

      if (!sourceSurvey) {
        setError('원본 설문지를 찾을 수 없어 결과를 표시할 수 없습니다.');
        setIsLoading(false);
        return;
      }
      setSurvey(sourceSurvey);

    } catch (e) {
      console.error('결과 로딩 중 오류:', e);
      setError('결과를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [submissionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !result || !survey) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error || '결과를 불러올 수 없습니다.'}</p>
        </div>
        <Link href="/survey/results" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          결과 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
        <p className="text-gray-600 mt-2">결과 상세</p>
        <p className="text-sm text-gray-500 mt-1">
          제출일: {new Date(result.submittedAt).toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
        {survey.questions.map((question, index) => (
          <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <h3 className="text-lg font-medium">
              Q{index + 1}. {question.text}
            </h3>
            <div className="mt-4 ml-4">
              <AnswerDisplay question={question} answer={result.answers[question.id]} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <Link href="/survey/results" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          결과 목록으로
        </Link>
      </div>
    </div>
  );
}
