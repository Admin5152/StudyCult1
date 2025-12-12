import React from 'react';
import { StudySet } from '../types';
import { BookOpen, PlayCircle, Clock, MoreVertical, GraduationCap } from 'lucide-react';

interface DashboardProps {
  decks: StudySet[];
  onSelectDeck: (deck: StudySet) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ decks, onSelectDeck }) => {
  if (decks.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
           <BookOpen size={40} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">No decks yet</h3>
        <p className="text-slate-500">Upload a PDF or paste notes to generate your first deck.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
      {decks.map((deck) => (
        <div 
          key={deck.id}
          onClick={() => onSelectDeck(deck)}
          className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 cursor-pointer transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
             <div className="bg-slate-100 p-2 rounded-full hover:bg-slate-200">
               <MoreVertical size={16} className="text-slate-600" />
             </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg ${
                deck.category?.includes('Science') ? 'bg-emerald-500' : 
                deck.category?.includes('Math') ? 'bg-blue-500' :
                deck.category?.includes('Art') ? 'bg-pink-500' :
                'bg-primary'
            }`}>
               {deck.title ? deck.title.charAt(0).toUpperCase() : 'G'}
            </div>
            {deck.createdAt && (
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {new Date(deck.createdAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
            {deck.title || "Untitled Deck"}
          </h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
             <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-bold text-slate-500 uppercase tracking-wide">
               {deck.category || 'General'}
             </span>
             <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs font-bold text-slate-500 flex items-center gap-1">
               <BookOpen size={10} /> {deck.flashcards.length} Cards
             </span>
          </div>

          <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">
            {deck.summary}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
             <div className="flex-1 flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                <PlayCircle size={14} /> Start Quiz
             </div>
             <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center">
                <GraduationCap size={12} className="text-slate-400" />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
