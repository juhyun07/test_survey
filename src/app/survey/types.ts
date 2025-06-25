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

// 설문조사 편집 관련 타입
export type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT_ENTRY';

export type MultipleChoiceOption = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options?: MultipleChoiceOption[];
  exportTag?: string; // Q8 같은 내보내기 태그
  optionCount: number; // 선택항목 수 (1-5)
};

export type SurveyEditorState = {
  questions: Question[];
  selectedQuestionId?: string;
  previewMode: boolean;
};

export type SurveyEditorProps = {
  onSave?: (questions: Question[]) => void;
};
