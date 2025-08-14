import { SavedSurvey } from '@/app/survey/settings/types';

// 로컬 스토리지에서 설문지 목록 가져오기
export const getSavedSurveys = (): SavedSurvey[] => {
  try {
    return JSON.parse(localStorage.getItem('savedSurveys') || '[]');
  } catch (error) {
    console.error('설문지 목록을 불러오는 중 오류가 발생했습니다:', error);
    return [];
  }
};

// 설문지 저장/업데이트
export const saveSurvey = (surveyData: Omit<SavedSurvey, 'id' | 'createdAt' | 'updatedAt'>, id?: string): string => {
  try {
    const savedSurveys = getSavedSurveys();
    const now = new Date().toISOString();
    
    if (id) {
      // 기존 설문지 업데이트
      const index = savedSurveys.findIndex(survey => survey.id === id);
      if (index !== -1) {
        savedSurveys[index] = {
          ...savedSurveys[index],
          ...surveyData,
          updatedAt: now
        };
      }
    } else {
      // 새 설문지 추가
      const newSurvey: SavedSurvey = {
        ...surveyData,
        id: `survey_${Date.now()}`,
        createdAt: now,
        updatedAt: now
      };
      savedSurveys.push(newSurvey);
    }

    localStorage.setItem('savedSurveys', JSON.stringify(savedSurveys));
    return id || ''; // 저장된 설문지 ID 반환
  } catch (error) {
    console.error('설문지 저장 중 오류가 발생했습니다:', error);
    throw new Error('설문지 저장에 실패했습니다.');
  }
};

// 설문지 삭제
export const deleteSurvey = (id: string): boolean => {
  try {
    const savedSurveys = getSavedSurveys();
    const filteredSurveys = savedSurveys.filter(survey => survey.id !== id);
    localStorage.setItem('savedSurveys', JSON.stringify(filteredSurveys));
    return true;
  } catch (error) {
    console.error('설문지 삭제 중 오류가 발생했습니다:', error);
    return false;
  }
};

// ID로 설문지 조회
export const getSurveyById = (id: string): SavedSurvey | undefined => {
  const savedSurveys = getSavedSurveys();
  return savedSurveys.find(survey => survey.id === id);
};
