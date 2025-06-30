export type QuestionType = 'text' | 'multiple_choice' | 'rating' | 'open_ended';

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: MultipleChoiceOption[];
  required?: boolean;
}

export interface SurveyEditorState {
  questions: Question[];
  previewMode: boolean;
}

export interface SurveyEditorProps {
  initialQuestions?: Question[];
  onSave: (questions: Question[]) => void;
  onDelete?: (questionId: string) => void;
}
