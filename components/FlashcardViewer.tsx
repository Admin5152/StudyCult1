import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Zap } from 'lucide-react';
import { Flashcard, Difficulty } from '../types';

interface FlashcardViewerProps {
  cards: Flashcard[];
}

const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentCard = cards[currentIndex];

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case Difficulty.Easy: return 'bg-green-100 text-green-800 border-green-200';
      case Difficulty.Medium: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case Difficulty.Hard: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (cards.length === 0) return <div className="text-center p-10 text-gray-500">No flashcards available.</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-8">
      
      {/* Progress */}
      <div className="w-full flex justify-between items-center mb-4 text-sm font-medium text-slate-500">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs border ${getDifficultyColor(currentCard.difficulty)} capitalize flex items-center gap-1`}>
          <Zap size={10} /> {currentCard.difficulty}
        </span>
      </div>

      {/* Card Area */}
      <div 
        className="relative w-full aspect-[16/10] perspective-1000 cursor-pointer group"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl border-2 border-slate-200 p-8 flex flex-col items-center justify-center text-center hover:border-primary transition-colors">
            <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-4 absolute top-6">Question</h3>
            <p className="text-xl md:text-2xl font-semibold text-slate-800">{currentCard.question}</p>
            <div className="absolute bottom-6 text-slate-400 text-xs flex items-center gap-1">
               <RotateCw size={12} /> Click to flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-indigo-400 text-sm font-bold uppercase tracking-wider mb-4 absolute top-6">Answer</h3>
            <p className="text-lg md:text-xl font-medium text-white">{currentCard.answer}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mt-8">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={24} />
        </button>

        <button 
          onClick={handleFlip}
          className="px-6 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors"
        >
          {isFlipped ? "Show Question" : "Show Answer"}
        </button>

        <button 
          onClick={handleNext} 
          disabled={currentIndex === cards.length - 1}
          className="p-3 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight size={24} />
        </button>
      </div>

    </div>
  );
};

export default FlashcardViewer;