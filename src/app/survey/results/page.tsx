'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SurveyResult {
  submissionId: string;
  surveyId: string;
  title: string;
  submittedAt: string;
  answers: Record<string, string[]>;
}

export default function SurveyResultsPage() {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadResults = () => {
    try {
      const savedResults = JSON.parse(localStorage.getItem('surveyResults') || '[]');
      savedResults.sort((a: SurveyResult, b: SurveyResult) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setResults(savedResults);
    } catch (error) {
      console.error('설문 결과 로딩 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleDelete = (submissionId: string) => {
    if (confirm('정말로 이 설문 결과를 삭제하시겠습니까?')) {
      try {
        const savedResults = JSON.parse(localStorage.getItem('surveyResults') || '[]');
        const updatedResults = savedResults.filter((result: SurveyResult) => result.submissionId !== submissionId);
        localStorage.setItem('surveyResults', JSON.stringify(updatedResults));
        setResults(updatedResults);
      } catch (error) {
        console.error('설문 결과 삭제 중 오류 발생:', error);
        alert('결과 삭제 중 오류가 발생했습니다.');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">설문 결과 목록</h1>
      
      {results.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md">
          <ul className="divide-y divide-gray-200">
            {results.map((result) => (
              <li key={result.submissionId} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg text-blue-600">{result.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      제출일: {new Date(result.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/survey/results/${result.submissionId}`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">결과 보기</Link>
                    <button 
                      onClick={() => handleDelete(result.submissionId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">제출된 설문 결과가 없습니다.</p>
          <p className="mt-2 text-gray-500">먼저 <Link href="/survey/test" className="text-blue-600 hover:underline">설문 테스트</Link>에서 설문을 완료해주세요.</p>
        </div>
      )}
    </div>
  );
}
