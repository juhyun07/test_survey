'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SavedSurvey } from '@/app/survey/settings/types';

export default function SurveyTestListPage() {
  const [surveys, setSurveys] = useState<SavedSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedSurveys = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
      setSurveys(savedSurveys);
    } catch (error) {
      console.error('설문 목록 로딩 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">설문 테스트 목록</h1>
      
      {surveys.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md">
          <ul className="divide-y divide-gray-200">
            {surveys.map((survey) => (
              <li key={survey.id} className="p-4 hover:bg-gray-50 transition-colors">
                <Link href={`/survey2/${survey.id}`} className="block">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg text-blue-600">{survey.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {survey.description || '설명 없음'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                       <p>생성일: {new Date(survey.createdAt).toLocaleDateString()}</p>
                       <p>{survey.questions.length}개 질문</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">테스트할 수 있는 설문이 없습니다.</p>
          <p className="mt-2 text-gray-500">먼저 <Link href="/survey/settings/new-style" className="text-blue-600 hover:underline">설문조사 설정</Link>에서 설문을 만들어 저장해주세요.</p>
        </div>
      )}
    </div>
  );
}
