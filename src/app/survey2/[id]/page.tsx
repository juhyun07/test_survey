'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SavedSurvey, Question, QuestionType } from '@/app/survey/settings/types';
import Link from 'next/link';

const QuestionPreview = ({ question, index }: { question: Question; index: number }) => {
  switch (question.type) {
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.MULTIPLE_CHOICE_MULTIPLE: {
      const isMultiple = question.type === QuestionType.MULTIPLE_CHOICE_MULTIPLE;
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">
            Q{index + 1}. {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <div className="space-y-2 mt-2 ml-4">
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center py-1">
                <input
                  type={isMultiple ? 'checkbox' : 'radio'}
                  name={`q${index}`}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  disabled
                />
                <span className="ml-2 text-gray-700">
                  {option.text || `옵션 ${idx + 1}`}
                </span>
              </div>
            ))}
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
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder={props.placeholder || '답변을 입력하세요'}
              disabled
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
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          disabled
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

  const handleDelete = () => {
    if (window.confirm('정말 이 설문지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        const savedSurveys = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
        const updatedSurveys = savedSurveys.filter((s: SavedSurvey) => s.id !== id);
        
        localStorage.setItem('savedSurveys', JSON.stringify(updatedSurveys));
        router.push('/survey2');
      } catch (error) {
        console.error('설문지 삭제 중 오류 발생:', error);
        alert('설문지 삭제 중 오류가 발생했습니다.');
      }
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
          href="/survey2" 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
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
              href="/survey2"
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
                <QuestionPreview question={question} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            이 설문지에는 아직 질문이 없습니다.
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
        <Link 
          href="/survey2"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
