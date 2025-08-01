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

  // 옵션 ID로 전체 옵션 객체를 찾는 재귀 함수
  const findOptionById = (options: any[], optionId: string): any | undefined => {
    for (const option of options) {
      if (option.id === optionId) return option;
      if (option.children) {
        const found = findOptionById(option.children, optionId);
        if (found) return found;
      }
    }
    return undefined;
  };

  // 선택된 옵션을 트리 형태로 렌더링하는 재귀 함수
  const renderOptionTree = (option: any, level = 0) => {
    if (!option) return null;

    const isSelected = answer.includes(option.id);

    return (
      <div key={option.id} style={{ marginLeft: `${level * 1.5}rem` }} className="mt-2">
        <div className="flex items-start">
          <div className="w-5 mr-2 flex-shrink-0">
            {isSelected && (
              <svg
                className="h-5 w-5 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <span className={`${isSelected ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
            {option.text || '알 수 없는 옵션'}
          </span>
        </div>

        {option.children && (
          <div>
            {option.children.map((child: any) => renderOptionTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  switch (question.type) {
    case QuestionType.CHECKBOX:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      // 최상위 옵션들만 렌더링 시작점으로 사용
      return (
        <div>
          {question.options?.map(option => renderOptionTree(option))}
        </div>
      );

    case QuestionType.TEXT_ENTRY:
      return <p className="text-gray-800 bg-gray-100 p-2 rounded">{answer[0]}</p>;
    
    case QuestionType.SIDE_BY_SIDE: {
      const props = question.props as any;
      if (!props || !props.rows || !props.columns) {
        return <p className="text-gray-500">질문 형식이 올바르지 않습니다.</p>;
      }

      const submittedAnswers: Record<string, string> = {};
      if (answer && Array.isArray(answer)) {
        answer.forEach(a => {
          const parts = a.split(':');
          if (parts.length >= 2) {
            submittedAnswers[parts[0]] = parts[1]; // rowId: subColumnId
          }
        });
      }

      return (
        <div className="relative border rounded-md p-4 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap"></th>
                  {props.columns.map((column: any) => (
                    <th 
                      key={column.id} 
                      colSpan={column.subColumns.length}
                      className="px-3 py-2 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap">항목</th>
                  {props.columns.flatMap((column: any) => 
                    column.subColumns.map((subCol: any) => (
                      <th key={subCol.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {subCol.label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {props.rows.map((row: any) => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.label}</td>
                    {props.columns.flatMap((col: any) => 
                      col.subColumns.map((subCol: any) => (
                        <td key={subCol.id} className="text-center px-3 py-4">
                          <input
                            type="radio"
                            name={`result-${question.id}-${row.id}`}
                            value={subCol.id}
                            checked={submittedAnswers[row.id] === subCol.id}
                            disabled
                            className={`h-4 w-4 border-gray-300 focus:ring-blue-500 ${submittedAnswers[row.id] === subCol.id ? 'text-blue-600 disabled:opacity-100' : 'text-gray-400 disabled:opacity-50'}`}
                          />
                        </td>
                      ))
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

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
