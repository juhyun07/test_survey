"use client";

import { useState } from "react";
import { SurveyResult } from "./types";
import SurveyPage1 from "./page1";
import SurveyPage2 from "./page2";
import SurveyPage3 from "./page3";
import SurveyComplete from "./complete";

export default function Survey() {
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<SurveyResult>({
    page1: { answer1: '', answer2: '' },
    page2: { answer1: '', answer2: '' },
    page3: { answer1: '', answer2: '' }
  });
  const totalPages = 3;

  const getProgressPercentage = () => {
    return ((currentPage - 1) / totalPages) * 100;
  };

  const nextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const complete = () => {
    setCurrentPage(4);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 1:
        return <SurveyPage1 onNext={nextPage} onAnswerChange={(page, answers) => setAnswers(prev => ({ ...prev, [page]: answers }))} />;
      case 2:
        return <SurveyPage2 onNext={nextPage} onAnswerChange={(page, answers) => setAnswers(prev => ({ ...prev, [page]: answers }))} />;
      case 3:
        return <SurveyPage3 onNext={nextPage} onComplete={complete} onAnswerChange={(page, answers) => setAnswers(prev => ({ ...prev, [page]: answers }))} />;
      case 4:
        return <SurveyComplete answers={answers} onReset={() => setCurrentPage(1)} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen pt-8">
      <h2 className="text-2xl font-bold mb-2">설문조사</h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>진행률</span>
          <span>{getProgressPercentage().toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>
      <div className="mt-8">
        {renderPage()}
      </div>
    </div>
  );
}
