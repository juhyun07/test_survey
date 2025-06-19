import { SurveyCompleteProps as ImportedSurveyCompleteProps, SurveyResult, SurveyPageState, SurveyPageState2, SurveyPageState3 } from "./types";
import { useState } from 'react';

interface SurveyResults {
  page1: {
    question1: string;
    question2: string;
  };
  page2: {
    question1: string;
    question2: string;
  };
  page3: {
    question1: string;
    question2: string;
  };
}

const initialResults: SurveyResults = {
  page1: {
    question1: "",
    question2: ""
  },
  page2: {
    question1: "",
    question2: ""
  },
  page3: {
    question1: "",
    question2: ""
  }
};

interface PageQuestions {
  question1: string;
  question2: string;
};

interface Questions {
  page1: PageQuestions;
  page2: PageQuestions;
  page3: PageQuestions;
};

interface SurveyCompleteProps {
  onReset?: () => void;
  answers: SurveyResult;
}

export default function SurveyComplete({ onReset, answers }: SurveyCompleteProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const questions: Questions = {
    page1: {
      question1: "이 설문조사는 몇 번째 페이지인가요?",
      question2: "이 페이지의 질문은 몇 개인가요?"
    },
    page2: {
      question1: "이 페이지는 몇 번째 페이지인가요?",
      question2: "이 페이지의 질문은 몇 개인가요?"
    },
    page3: {
      question1: "이 설문조사는 몇 페이지로 구성되어 있나요?",
      question2: "이 페이지는 마지막 페이지인가요?"
    }
  };

  const handleViewResults = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="text-center py-16">
      <h3 className="text-2xl font-bold mb-4">설문조사를 완료했습니다.</h3>
      <p className="text-gray-600">감사합니다!</p>
      
      <div className="flex flex-col gap-4 mt-8">
        <button
          onClick={handleViewResults}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          결과 보기
        </button>
        
        <button
          onClick={onReset}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
        >
          처음으로 돌아가기
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">설문 결과</h3>
            
            {Object.entries(answers).map(([page, pageAnswers], index) => {
              const pageKey = page as keyof Questions;
              return (
                <div key={page} className="mb-6 p-3 border rounded-lg">
                  <h4 className="text-lg font-bold mb-2">{index + 1}번 페이지</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <span className="font-semibold">{questions[pageKey].question1}</span>
                      <p className="text-gray-700 bg-gray-50 p-1.5 rounded">{page === 'page1' ? (pageAnswers as SurveyPageState).answer1 :
                       page === 'page2' ? (pageAnswers as SurveyPageState2).answer1 :
                       page === 'page3' ? (pageAnswers as SurveyPageState3).answer1 : ''}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold">{questions[pageKey].question2}</span>
                      <p className="text-gray-700 bg-gray-50 p-1.5 rounded">{page === 'page1' ? (pageAnswers as SurveyPageState).answer2 :
                       page === 'page2' ? (pageAnswers as SurveyPageState2).answer2 :
                       page === 'page3' ? (pageAnswers as SurveyPageState3).answer2 : ''}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
