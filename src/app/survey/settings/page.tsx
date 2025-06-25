'use client';

import SurveyEditor from '../editor';

export default function SurveySettingsPage() {
  const handleSave = (questions: any[]) => {
    // 질문 데이터를 저장하는 로직
    console.log('설문조사가 저장되었습니다:', questions);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold p-4">설문조사 설정</h1>
      <SurveyEditor 
        onSave={handleSave}
      />
    </div>
  );
}
