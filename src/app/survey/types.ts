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
};

export type SurveyPageState2 = {
  answer1: string;
  answer2: string;
};

export type SurveyPageState3 = {
  answer1: string;
  answer2: string;
};

export type SurveyResult = {
  page1: SurveyPageState;
  page2: SurveyPageState2;
  page3: SurveyPageState3;
};

export type SurveyCompleteState = {
  isOpen: boolean;
  results: SurveyResult | null;
};
