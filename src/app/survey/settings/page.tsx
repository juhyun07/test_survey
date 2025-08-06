'use client';

import SurveyEditor from './editor';
import { Question } from './types';

export default function SurveySettingsPage() {
    const handleSave = (questions: Question[]) => {
    // 질문 데이터를 저장하는 로직
    console.log('설문조사가 저장되었습니다:', questions);
  };

  return (
    <div className="max-w-9xl mx-auto">
      <h1 className="text-2xl font-bold p-3">설문조사 설정</h1>
      <SurveyEditor 
        onSave={handleSave}
      />
    </div>
  );
}
