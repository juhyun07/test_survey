'use client';

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { SavedSurvey, Question, QuestionType } from '@/app/survey/settings/types';
import Link from 'next/link';

const QuestionPreview = ({
  question,
  index,
  answer,
  onAnswerChange,
}: {
  question: Question;
  index: number;
  answer: string[];
  onAnswerChange: (value: string | string[], questionType: QuestionType) => void;
}) => {
  switch (question.type) {
    case QuestionType.CHECKBOX:
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE: {
      const isMultiple = question.type === QuestionType.MULTIPLE_CHOICE_MULTIPLE || question.type === QuestionType.CHECKBOX;

      const renderOptions = (optionsToRender: any[], level = 0) => {
        return optionsToRender.map((option, idx) => {
          const isSelected = answer?.includes(option.id);
          return (
            <div key={option.id || idx} style={{ marginLeft: `${level * 2}rem` }}>
              <div className="flex items-center py-1">
                <input
                  type={isMultiple ? 'checkbox' : 'radio'}
                  name={`q-${question.id}`}
                  id={`q-${question.id}-${option.id}`}
                  checked={isSelected}
                  onChange={() => onAnswerChange(option.id, question.type)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`q-${question.id}-${option.id}`} className="ml-2 text-gray-700">
                  {option.text || `옵션 ${idx + 1}`}
                </label>
              </div>
              {isSelected && option.children && (
                <div className="mt-2">
                  {renderOptions(option.children, level + 1)}
                </div>
              )}
            </div>
          );
        });
      };

      return (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            Q{index + 1}. {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <div className="space-y-2 mt-2 ml-4">
            {renderOptions(question.options || [])}
          </div>
        </div>
      );
    }
    
    case QuestionType.TEXT_ENTRY: {
      const props = question.props || {};
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            Q{index + 1}. {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <div className="mt-2">
            <input
              type="text"
              value={answer?.[0] || ''}
              onChange={(e) => onAnswerChange(e.target.value, question.type)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={props.placeholder || '답변을 입력하세요'}
              maxLength={props.maxLength}
            />
            {props.maxLength && (
              <p className="mt-1 text-xs text-gray-500">
                최대 {props.maxLength}자까지 입력 가능
              </p>
            )}
          </div>
        </div>
      );
    }
    
    case QuestionType.SIDE_BY_SIDE: {
      const props = question.props || {};
      const rows = props.rows || [];
      const columns = props.columns || [];
      
      if (rows.length === 0 || columns.length === 0) {
        return (
          <div className="text-gray-500">
            Q{index + 1}. {question.text} (데이터 없음)
          </div>
        );
      }
      
      const allSubColumns = columns.flatMap((col: any) => 
        (col.subColumns || []).map((subCol: any) => ({
          ...subCol,
          columnId: col.id
        }))
      );
      
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            Q{index + 1}. {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          
          <div className="overflow-x-auto mt-2">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border p-2 bg-gray-100" rowSpan={2} style={{ width: '200px' }}>항목</th>
                  {columns.map((col: any, colIndex: number) => (
                    <th 
                      key={col.id || colIndex} 
                      className="border p-2 bg-gray-50"
                      colSpan={(col.subColumns || []).length}
                    >
                      {col.label || `열 ${colIndex + 1}`}
                    </th>
                  ))}
                </tr>
                <tr>
                  {allSubColumns.map((subCol: any, idx: number) => (
                    <th key={subCol.id || idx} className="border p-2 bg-gray-50 text-sm">
                      {subCol.label || `옵션 ${idx + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, rowIndex: number) => (
                  <tr key={row.id || rowIndex}>
                    <td className="border p-2 font-medium">
                      {row.label || `항목 ${rowIndex + 1}`}
                    </td>
                    {allSubColumns.map((subCol: any, colIdx: number) => (
                      <td key={`${subCol.columnId}-${subCol.id}-${row.id}`} className="border p-2 text-center">
                        <input
                          type="radio"
                          name={`row-${row.id || rowIndex}-${subCol.columnId}`}
                          checked={answer?.includes(`${row.id}:${subCol.id}`)}
                          onChange={() => onAnswerChange(`${row.id}:${subCol.id}`, question.type)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
    
    default:
      return (
        <div className="text-gray-500">
          Q{index + 1}. {question.text} (미리보기를 지원하지 않는 질문 유형입니다)
        </div>
      );
  }
};
export default function SurveyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [survey, setSurvey] = useState<SavedSurvey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurvey = () => {
      try {
        const savedSurveys = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
        const foundSurvey = savedSurveys.find((s: SavedSurvey) => s.id === id);
        
        if (foundSurvey) {
          setSurvey(foundSurvey);
        } else {
          setError('요청하신 설문지를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('설문지 로딩 중 오류 발생:', error);
        setError('설문지 로딩 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSurvey();
  }, [id]);

  const handleAnswerChange = (questionId: string, value: string | string[], questionType: QuestionType) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      let newAnswers: string[] = [...currentAnswers];

      switch (questionType) {
        case QuestionType.CHECKBOX:
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
          if (typeof value === 'string') {
            newAnswers = currentAnswers.includes(value)
              ? currentAnswers.filter(id => id !== value)
              : [...currentAnswers, value];
          }
          break;
        case QuestionType.MULTIPLE_CHOICE:
          newAnswers = [value as string];
          break;
        case QuestionType.TEXT_ENTRY:
          newAnswers = [value as string];
          break;
        case QuestionType.SIDE_BY_SIDE:
          if (typeof value === 'string') {
            const [rowId] = value.split(':');
            const filteredAnswers = currentAnswers.filter(ans => !ans.startsWith(`${rowId}:`));
            newAnswers = [...filteredAnswers, value];
          }
          break;
        default:
          break;
      }
      return { ...prev, [questionId]: newAnswers };
    });
  };

  const handleDelete = () => {
    if (window.confirm('정말 이 설문지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        const savedSurveys = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
        const updatedSurveys = savedSurveys.filter((s: SavedSurvey) => s.id !== id);
        
        localStorage.setItem('savedSurveys', JSON.stringify(updatedSurveys));
        router.push('/survey/test');
      } catch (error) {
        console.error('설문지 삭제 중 오류 발생:', error);
        alert('설문지 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSubmit = () => {
    if (!survey) return;

    for (const question of survey.questions) {
      if (!question.required) {
        continue; // 필수 항목이 아니면 건너뜁니다.
      }

      const answer = answers[question.id];
      let isAnswered = false;

      switch (question.type) {
        case QuestionType.TEXT_ENTRY:
          isAnswered = !!answer && answer.length > 0 && answer[0].trim() !== '';
          break;

        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.CHECKBOX:
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
          isAnswered = !!answer && answer.length > 0;
          break;

        case QuestionType.SIDE_BY_SIDE:
          const rows = question.props?.rows || [];
          // 행이 없으면 응답할 수 없으므로, 유효성 검사를 통과시킵니다.
          if (rows.length === 0) {
            isAnswered = true;
            break;
          }
          const answeredRows = new Set((answer || []).map(a => a.split(':')[0]));
          isAnswered = rows.length === answeredRows.size;
          break;

        default:
          // 지원하지 않는 질문 유형은 일단 통과시킵니다.
          isAnswered = true;
          break;
      }

      if (!isAnswered) {
        alert(`필수 질문입니다: "${question.text}"`);
        return;
      }
    }

    const result = {
      submissionId: uuidv4(),
      surveyId: survey.id,
      title: survey.title,
      submittedAt: new Date().toISOString(),
      answers: answers,
    };

    try {
      const savedResults = JSON.parse(localStorage.getItem('surveyResults') || '[]');
      const updatedResults = [...savedResults, result];
      localStorage.setItem('surveyResults', JSON.stringify(updatedResults));
      alert('설문이 성공적으로 제출되었습니다.');
      router.push('/survey/test');
    } catch (error) {
      console.error('설문 결과 저장 중 오류 발생:', error);
      alert('설문 결과 저장 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error || '알 수 없는 오류가 발생했습니다.'}</p>
        </div>
        <Link 
          href="/survey/test" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600 inline-block"
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
            {survey.description && (
              <p className="text-gray-600">{survey.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              생성일: {new Date(survey.createdAt).toLocaleString()}
              {survey.updatedAt !== survey.createdAt && (
                <span className="ml-2">(마지막 수정: {new Date(survey.updatedAt).toLocaleString()})</span>
              )}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link 
              href="/survey/test"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              목록으로
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md p-8 space-y-8">
        {survey.questions.length > 0 ? (
          <div className="space-y-8">
            {survey.questions.map((question, index) => (
              <div 
                key={question.id} 
                className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
              >
                <QuestionPreview
                  question={question}
                  index={index}
                  answer={answers[question.id] || []}
                  onAnswerChange={(value) => handleAnswerChange(question.id, value, question.type)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>질문이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          제출하기
        </button>
      </div>
    </div>
  );
}
