'use client';

import { useEffect, useState } from 'react';
import { PageComponentProps } from '@/components/HashRouterProvider';
import { SavedSurvey, Question, QuestionType, MultipleChoiceOption, MultipleChoiceQuestionProps, SideBySideQuestionProps, ColumnGroup, SubColumn } from '@/app/survey/settings/types';

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

  const renderOptionTree = (option: MultipleChoiceOption, level = 0) => {
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
            {option.children.map((child: MultipleChoiceOption) => renderOptionTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  switch (question.type) {
    case QuestionType.CHECKBOX:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
      return (
        <div>
          {(question.props as MultipleChoiceQuestionProps).options?.map(option => renderOptionTree(option))}
        </div>
      );

    case QuestionType.TEXT_ENTRY:
      return <p className="text-gray-800 bg-gray-100 p-2 rounded whitespace-pre-wrap break-words">{answer[0]}</p>;
    
    case QuestionType.SIDE_BY_SIDE: {
      const props = question.props as SideBySideQuestionProps;
      const rows = (props.rows ?? []).map(opt => ({ id: opt.id, label: opt.text }));

      if (!props || !rows || !props.columns) {
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
                  {props.columns.map((group: ColumnGroup) => (
                    <th key={group.id} colSpan={group.subColumns.length} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l">
                      {group.text}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="w-[200px] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 whitespace-nowrap"></th>
                  {props.columns.flatMap((group: ColumnGroup) => 
                    group.subColumns.map((sub: SubColumn) => (
                      <th key={sub.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-l">
                        {sub.label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map(row => (
                  <tr key={row.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.label}</td>
                    {props.columns.flatMap((group: ColumnGroup) => 
                      group.subColumns.map((sub: SubColumn) => (
                        <td key={sub.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center border-l">
                          {submittedAnswers[row.id] === sub.id && (
                            <svg className="h-6 w-6 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
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
      return <p className="text-gray-500">알 수 없는 질문 유형</p>;
  }
};

export default function SurveyResultDetailPage({ params }: PageComponentProps) {
  const submissionId = params?.submissionId;
  const [result, setResult] = useState<SurveyResult | null>(null);
  const [survey, setSurvey] = useState<SavedSurvey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (submissionId) {
      try {
        const allResults: SurveyResult[] = JSON.parse(localStorage.getItem('surveyResults') || '[]');
        const currentResult = allResults.find(r => r.submissionId === submissionId);
        setResult(currentResult || null);

        if (currentResult) {
          const allSurveys: SavedSurvey[] = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
          const sourceSurvey = allSurveys.find(s => s.id === currentResult.surveyId);
          setSurvey(sourceSurvey || null);
        }
      } catch (error) {
        console.error('결과 또는 설문 로딩 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [submissionId]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  if (!result || !survey) {
    return <div className="text-center py-10">결과를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{result.title}</h1>
        <p className="text-gray-600 mb-6">제출일: {new Date(result.submittedAt).toLocaleString()}</p>

        <div className="space-y-8 mt-8">
          {survey.questions.map((question, index) => (
            <div key={question.id} className="p-6 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{index + 1}. {question.text}</h2>
              <AnswerDisplay question={question} answer={result.answers[question.id]} />
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="#/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">결과 목록으로 돌아가기</a>
        </div>
      </div>
    </div>
  );
}
