'use client';

import React, { useState, useEffect } from 'react';
import { PageComponentProps } from '@/components/HashRouterProvider';
import { v4 as uuidv4 } from 'uuid';
import { Question, QuestionType, SavedSurvey } from '@/app/survey/settings/types';
import { MultipleChoiceEditor } from '@/app/survey/settings/new-style/components/MultipleChoiceEditor';
import { CheckBoxEditor } from '@/app/survey/settings/new-style/components/CheckBoxEditor';
import { SideBySideEditor } from '@/app/survey/settings/new-style/components/SideBySideEditor';
import { TextEntryEditor } from '@/app/survey/settings/new-style/components/TextEntryEditor';
import { PreviewModal } from '@/app/survey/settings/new-style/components/PreviewModal';

type EditorQuestion = Question & { isExpanded?: boolean };

// This function can be moved to a utility file if needed
const createNewQuestion = (type: QuestionType): EditorQuestion => {
    const id = uuidv4();
    switch (type) {
      case QuestionType.CHECKBOX:
      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
        return {
          id,
          type,
          text: '새 질문',
          isRequired: false,
          props: {
            options: [
              { id: uuidv4(), text: '옵션 1' },
              { id: uuidv4(), text: '옵션 2' },
            ],
          },
        };
      case QuestionType.SIDE_BY_SIDE:
        return {
          id,
          type,
          text: '새 질문',
          isRequired: false,
          props: {
            rows: [
              { id: 'r1', text: '항목 1' },
              { id: 'r2', text: '항목 2' },
            ],
            columns: [
              {
                id: 'c1',
                text: '열 1',
                subColumns: [
                  { id: 'c1-1', label: '옵션 1' },
                  { id: 'c1-2', label: '옵션 2' },
                ],
              },
              {
                id: 'c2',
                text: '열 2',
                subColumns: [
                  { id: 'c2-1', label: '옵션 1' },
                  { id: 'c2-2', label: '옵션 2' },
                ],
              },
            ],
          },
        };
      case QuestionType.TEXT_ENTRY:
        return {
          id,
          type,
          text: '새 질문',
          isRequired: false,
          props: {
            maxLength: 100,
            placeholder: '답변을 입력하세요',
          },
        };
      default:
        const exhaustiveCheck: never = type;
        throw new Error(`Unhandled case: ${exhaustiveCheck}`);
    }
  };

export default function SurveyEditor({ params }: PageComponentProps) {
  const surveyId = params?.id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<EditorQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (!surveyId) {
      setIsLoading(false);
      setError('설문지 ID가 없습니다.');
      return;
    }

    try {
      const savedSurveys: SavedSurvey[] = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
      const surveyToEdit = savedSurveys.find(s => s.id === surveyId);

      if (surveyToEdit) {
        setTitle(surveyToEdit.title);
        setDescription(surveyToEdit.description || '');
        setQuestions(surveyToEdit.questions.map((q: Question) => ({ ...q, isExpanded: false })));
      } else {
        setError('설문지를 찾을 수 없습니다.');
      }
    } catch (e) {
      console.error('설문지 로딩 실패:', e);
      setError('설문지를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [surveyId]);

  const handleUpdateQuestion = (
    questionId: string,
    updates: Partial<EditorQuestion>
  ) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, ...updates } as EditorQuestion : q))
    );
  };

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = createNewQuestion(type);
    newQuestion.isExpanded = true;
    setQuestions(prev => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId ? { ...q, isExpanded: !q.isExpanded } : q
      )
    );
  };

  const handleUpdateSurvey = () => {
    if (!surveyId) return;

    try {
      const savedSurveys: SavedSurvey[] = JSON.parse(localStorage.getItem('savedSurveys') || '[]');
      const surveyToEdit = savedSurveys.find(s => s.id === surveyId);

      if (!surveyToEdit) {
        alert('업데이트할 설문지를 찾을 수 없습니다.');
        return;
      }

      const updatedSurvey: SavedSurvey = {
        ...surveyToEdit,
        title,
        description,
        questions,
        updatedAt: new Date().toISOString(),
      };

      const updatedSurveys = savedSurveys.map(s => s.id === surveyId ? updatedSurvey : s);

      localStorage.setItem('savedSurveys', JSON.stringify(updatedSurveys));
      alert('설문지가 성공적으로 저장되었습니다.');
      window.location.hash = '#/';
    } catch (e) {
      console.error('설문지 업데이트 실패:', e);
      alert('설문지 업데이트 중 오류가 발생했습니다.');
    }
  };

  const renderEditor = (question: EditorQuestion) => {
    const commonProps = {
        key: question.id,
        question: question.text,
        isRequired: question.isRequired,
        onQuestionChange: (text: string) => handleUpdateQuestion(question.id, { text }),
        onRequiredChange: (isRequired: boolean) => handleUpdateQuestion(question.id, { isRequired }),
    };

    switch (question.type) {
        case QuestionType.CHECKBOX:
        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            const Editor = question.type === QuestionType.CHECKBOX ? CheckBoxEditor : MultipleChoiceEditor;
            return <Editor {...commonProps} options={question.props.options || []} onOptionsChange={(options) => handleUpdateQuestion(question.id, { props: { ...question.props, options } })} />;
        case QuestionType.SIDE_BY_SIDE:
            return <SideBySideEditor {...commonProps} rows={(question.props.rows || []).map(r => ({ id: r.id, label: r.text }))} columns={(question.props.columns || []).map(c => ({ ...c, label: c.text }))} onRowsChange={(rows) => handleUpdateQuestion(question.id, { props: { ...question.props, rows: rows.map(r => ({ id: r.id, text: r.label })) } })} onColumnsChange={(columns) => handleUpdateQuestion(question.id, { props: { ...question.props, columns: columns.map(c => ({ ...c, text: c.label })) } })} />;
        case QuestionType.TEXT_ENTRY:
            return <TextEntryEditor {...commonProps} maxLength={question.props?.maxLength || undefined} placeholder={question.props?.placeholder || ''} onMaxLengthChange={(maxLength) => handleUpdateQuestion(question.id, { props: { ...question.props, maxLength } })} onPlaceholderChange={(placeholder) => handleUpdateQuestion(question.id, { props: { ...question.props, placeholder } })} />;
        default:
            return null;
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">...loading</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">설문조사 편집기</h1>
        <div className="space-x-2">
          <button onClick={() => setIsPreviewOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">미리보기</button>
          <button onClick={handleUpdateSurvey} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">변경사항 저장</button>
          <a href="#/" className="text-gray-600 hover:text-gray-800">목록으로</a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="설문지 제목" className="text-2xl font-bold w-full border-b-2 pb-2 mb-4 focus:outline-none focus:border-blue-500" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설문지 설명" className="w-full p-2 border rounded-md" />
      </div>

      {questions.map((q, index) => (
        <div key={q.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleQuestionExpansion(q.id)}>
            <h3 className="text-lg font-semibold">Q{index + 1}: {q.text}</h3>
            <div className="flex items-center">
                <button onClick={(e) => { e.stopPropagation(); handleRemoveQuestion(q.id); }} className="text-red-500 hover:text-red-700 p-1">삭제</button>
                <span>{q.isExpanded ? '접기' : '펼치기'}</span>
            </div>
          </div>
          {q.isExpanded && <div className="mt-4 border-t pt-4">{renderEditor(q)}</div>}
        </div>
      ))}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">새 질문 추가</h3>
        <div className="flex space-x-2">
          <button onClick={() => handleAddQuestion(QuestionType.MULTIPLE_CHOICE)} className="px-3 py-1 bg-gray-200 rounded-md">단일선택</button>
          <button onClick={() => handleAddQuestion(QuestionType.CHECKBOX)} className="px-3 py-1 bg-gray-200 rounded-md">복수선택</button>
          <button onClick={() => handleAddQuestion(QuestionType.TEXT_ENTRY)} className="px-3 py-1 bg-gray-200 rounded-md">텍스트</button>
          <button onClick={() => handleAddQuestion(QuestionType.SIDE_BY_SIDE)} className="px-3 py-1 bg-gray-200 rounded-md">병렬비교</button>
        </div>
      </div>

      <PreviewModal isOpen={isPreviewOpen} questions={questions} onClose={() => setIsPreviewOpen(false)} />
    </div>
  );
}
