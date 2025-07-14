export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_CHOICE_MULTIPLE = 'MULTIPLE_CHOICE_MULTIPLE',
  SIDE_BY_SIDE = 'SIDE_BY_SIDE',
  TEXT_ENTRY = 'TEXT_ENTRY'
}

// 각 질문 유형별 추가 프로퍼티 인터페이스
// 모든 질문 유형에 공통으로 사용될 수 있는 속성들
export interface BaseQuestionProps {
  options?: any[];
  optionCount?: number;
  [key: string]: any;
}

export interface MultipleChoiceQuestionProps extends BaseQuestionProps {
  options: MultipleChoiceOption[];
  optionCount: number;
}

export interface SubColumn {
  id: string;
  label: string;
}

export interface ColumnGroup {
  id: string;
  label: string;
  subColumns: SubColumn[];
}

export interface SideBySideQuestionProps extends BaseQuestionProps {
  sideBySideOptions: SideBySideOption[];
  optionCount: number;
  columnCount: number;
  subColumnCounts: number[];
  columns: ColumnGroup[];
}

// 열 수와 서술 수의 범위
export const COLUMN_COUNT_RANGE = [2, 4];
export const OPTION_COUNT_RANGE = [1, 4];

export interface TextEntryQuestionProps extends BaseQuestionProps {
  maxLength?: number;
  placeholder?: string;
}

// 질문 유형별 프로퍼티 매핑
export type QuestionPropsMap = {
  [QuestionType.MULTIPLE_CHOICE]: MultipleChoiceQuestionProps;
  [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: MultipleChoiceQuestionProps;
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
  descriptionCount: number;
  columns: Array<{
    title: string;
    answers: Array<{
      id: string;
      text: string;
    }>;
  }>;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  exportTag?: string;
  options?: any[];
  optionCount?: number;
  columnCount?: number;
  isExpanded?: boolean;
  props?: any;
}

export interface SavedSurvey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
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
