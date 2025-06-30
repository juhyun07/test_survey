export type SurveyPageProps = {
  onNext: () => void;
};

export type SurveyCompleteProps = {
  onComplete: () => void;
  onReset?: () => void;
};

export type SurveyPageState = {
  answer1: string;
  answer2: string;
  timeSpent: number; // 페이지에서 머문 시간 (초)
};

export type SurveyPageState2 = {
  answer1: string;
  answer2: string;
  timeSpent: number;
};

export type SurveyPageState3 = {
  answer1: string;
  answer2: string;
  timeSpent: number;
};

export type SurveyResult = {
  page1: SurveyPageState;
  page2: SurveyPageState2;
  page3: SurveyPageState3;
  totalTime: number; // 전체 설문 조사 시간 (초)
};

export type SurveyCompleteState = {
  isOpen: boolean;
  results: SurveyResult | null;
};
