import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { Quiz, QuizQuestion, QuestionType } from '../types';

interface QuizTakerProps {
  quiz: Quiz;
}

const QuizTaker: React.FC<QuizTakerProps> = ({ quiz }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion: QuizQuestion = quiz.questions[currentQIndex];

  const handleSubmit = () => {
    let isCorrect = false;

    if (currentQuestion.type === QuestionType.MultipleChoice) {
      if (selectedOption === currentQuestion.correct_answer) {
        isCorrect = true;
      }
    } else {
      // Basic check for short answer (just for UI interaction, real grading would need AI)
      if (textAnswer.trim().length > 0) {
        isCorrect = true; // Award point for effort in this demo
      }
    }

    if (isCorrect) setScore(prev => prev + 1);
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setTextAnswer("");
      setIsSubmitted(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedOption(null);
    setTextAnswer("");
    setIsSubmitted(false);
  };

  if (showResults) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Award size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 mb-6">You scored {score} out of {quiz.questions.length}</p>
        
        <div className="w-full bg-slate-100 rounded-full h-4 mb-8 overflow-hidden">
          <div 
            className="bg-primary h-full rounded-full transition-all duration-1000" 
            style={{ width: `${(score / quiz.questions.length) * 100}%` }}
          ></div>
        </div>

        <button 
          onClick={handleRestart}
          className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <RotateCcw size={18} /> Restart Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">{quiz.title}</h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
            Q{currentQIndex + 1}/{quiz.questions.length}
          </span>
        </div>

        <div className="p-6 md:p-8">
          <h4 className="text-lg md:text-xl font-medium text-slate-800 mb-6">
            {currentQuestion.question}
          </h4>

          {/* Multiple Choice Options */}
          {currentQuestion.type === QuestionType.MultipleChoice && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.correct_answer;
                
                let containerClass = "border-slate-200 hover:bg-slate-50";
                if (isSubmitted) {
                    if (isCorrect) containerClass = "border-green-500 bg-green-50 text-green-700";
                    else if (isSelected && !isCorrect) containerClass = "border-red-500 bg-red-50 text-red-700";
                    else containerClass = "border-slate-200 opacity-50";
                } else if (isSelected) {
                    containerClass = "border-primary bg-indigo-50 text-primary ring-1 ring-primary";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => !isSubmitted && setSelectedOption(option)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${containerClass}`}
                  >
                    <span>{option}</span>
                    {isSubmitted && isCorrect && <CheckCircle2 size={20} className="text-green-600" />}
                    {isSubmitted && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short Answer Input */}
          {currentQuestion.type === QuestionType.ShortAnswer && (
            <div className="space-y-4">
               <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={isSubmitted}
                placeholder="Type your answer here..."
                className="w-full p-4 rounded-xl border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none h-32 disabled:bg-slate-50 disabled:text-slate-500"
              />
              {isSubmitted && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <span className="font-bold block mb-1">Ideal Answer:</span>
                    {currentQuestion.ideal_answer}
                 </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-8 flex justify-end">
            {!isSubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={currentQuestion.type === QuestionType.MultipleChoice ? !selectedOption : !textAnswer.trim()}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                {currentQIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;
