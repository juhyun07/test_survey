'use client';

import { useState, useEffect } from 'react';
import { SavedSurvey } from '@/app/survey/settings/types';
import { PageComponentProps } from '@/components/HashRouterProvider';
import Link from 'next/link';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SurveyListPage(_props: PageComponentProps) {
  const [surveys, setSurveys] = useState<SavedSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSurveys = () => {
      try {
        const savedSurveys = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
        setSurveys(savedSurveys);
      } catch (error) {
        console.error('설문지 목록을 불러오는 중 오류가 발생했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveys();
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">저장된 설문지 목록</h1>
        <Link 
          href="/survey/settings/new-style"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          새 설문지 만들기
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <p className="text-lg text-gray-600 mb-4">저장된 설문지가 없습니다.</p>
          <Link 
            href="/survey/settings/new-style"
            className="text-blue-600 hover:underline"
          >
            새 설문지 만들기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <div 
              key={survey.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100"
            >
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-blue-600 truncate">{survey.title}</h3>
                </div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500">
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                {survey.description && (
                  <p className="text-gray-600 mb-4">{survey.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {survey.questions.length}개의 질문
                  </span>
                  <div className="flex space-x-2">
                    <a 
                      href={`#/${survey.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      설문 진행
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
