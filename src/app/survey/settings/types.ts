export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SIDE_BY_SIDE = 'SIDE_BY_SIDE',
  TEXT_ENTRY = 'TEXT_ENTRY'
}

// 각 질문 유형별 추가 프로퍼티 인터페이스
export interface MultipleChoiceQuestionProps {
  options: MultipleChoiceOption[];
  optionCount: number;
}

export interface SideBySideQuestionProps {
  sideBySideOptions: SideBySideOption[];
  optionCount: number;
  columnCount: number;
}

// 열 수와 서술 수의 범위
export const COLUMN_COUNT_RANGE = [2, 4];
export const OPTION_COUNT_RANGE = [1, 4];

export interface TextEntryQuestionProps {
  maxLength?: number;
  placeholder?: string;
}

// 질문 유형별 프로퍼티 매핑
export type QuestionPropsMap = {
  [QuestionType.MULTIPLE_CHOICE]: MultipleChoiceQuestionProps;
  [QuestionType.SIDE_BY_SIDE]: SideBySideQuestionProps;
  [QuestionType.TEXT_ENTRY]: TextEntryQuestionProps;
};

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface SideBySideOption {
  id: string;
  text: string;
  columns: {
    title: string;
    answers: string[];
  }[];
  descriptionCount: number;  // 서술 수
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required?: boolean;
  exportTag?: string;
  options?: MultipleChoiceOption[];
  optionCount?: number;
  props: QuestionPropsMap[QuestionType];
}

export interface SurveyEditorState {
  questions: Question[];
  previewMode: boolean;
  selectedQuestionId?: string;
}

export interface SurveyEditorProps {
  initialQuestions?: Question[];
  onSave: (questions: Question[]) => void;
  onDelete?: (questionId: string) => void;
}
