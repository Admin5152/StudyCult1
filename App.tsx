import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Sparkles, Code, FileText, Loader2, PlayCircle, 
  GraduationCap, Star, LayoutGrid, Plus,
  Trophy, Flame, Upload, LogOut, Save, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, logoutUser, saveStudySet, getUserDecks } from './services/firebase';
import { extractTextFromFile } from './services/fileProcessor';
import { generateStudyMaterial } from './services/geminiService';
import { StudySet } from './types';
import FlashcardViewer from './components/FlashcardViewer';
import QuizTaker from './components/QuizTaker';
import JsonView from './components/JsonView';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

type ViewMode = 'dashboard' | 'create' | 'study';
type Tab = 'summary' | 'flashcards' | 'quiz' | 'json';

const CATEGORIES = [
  "General",
  "Computer Science",
  "Math & Physics",
  "Medicine & Biology",
  "Law & Politics",
  "History",
  "Literature",
  "Languages",
  "Engineering",
  "Business & Econ",
  "Psychology",
  "Arts"
];

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [studyData, setStudyData] = useState<StudySet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deckError, setDeckError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('flashcards');
  const [userDecks, setUserDecks] = useState<StudySet[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  // Saving State
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        loadDecks(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadDecks = async (uid: string) => {
    try {
      const decks = await getUserDecks(uid);
      setUserDecks(decks as StudySet[]);
      setDeckError(null);
    } catch (err: any) {
      console.error("Failed to load decks", err);
      // Simplify error message for user
      if (err.message && err.message.includes("Cloud Firestore API")) {
         setDeckError("DB Connection Issue: Please refresh page in 1 minute. (API enabling...)");
      } else {
         setDeckError("Could not connect to library.");
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError(null);
    try {
      const text = await extractTextFromFile(file);
      setInputText(prev => prev + "\n\n" + text);
    } catch (err: any) {
      setError("Failed to read file. Please ensure it is a valid PDF.");
    } finally {
      setUploadingFile(false);
    }
  };

  const saveDeckToFirebase = async (dataToSave: StudySet, manual = false) => {
    if (!user) return;
    
    setIsSaving(true);
    setDeckError(null);
    try {
      const title = dataToSave.title || "New Deck";
      const id = await saveStudySet(user.uid, { ...dataToSave, title, category: selectedCategory });
      
      // Update local state
      const newData = { ...dataToSave, id };
      setStudyData(newData);
      setIsSaved(true);
      
      // Refresh library in background
      loadDecks(user.uid);
      
      if (manual) {
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (saveErr: any) {
      console.warn("Could not save deck to Firestore", saveErr);
      if (manual) {
        setDeckError("Save Failed. API may still be initializing. Try again in 30s.");
      } else {
        setDeckError("Deck generated but not saved. Click 'Save Deck' to retry.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setStudyData(null);
    setIsSaved(false);

    try {
      const data = await generateStudyMaterial(inputText, selectedCategory);
      const title = inputText.split('\n')[0].substring(0, 30) || "New Deck";
      data.title = title;
      data.category = selectedCategory;

      setStudyData(data);
      setViewMode('study');
      setActiveTab('flashcards');
      
      // Attempt auto-save
      if (user) {
        saveDeckToFirebase(data, false);
      }
    } catch (err: any) {
      setError("Failed to summon knowledge. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = () => {
    if (studyData && user) {
      saveDeckToFirebase(studyData, true);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setViewMode('dashboard');
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (!user) return <Auth />;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed h-full z-20">
        <div className="p-6 flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('dashboard')}>
          <div className="relative">
             <Star className="text-primary fill-primary w-8 h-8 animate-bounce-small" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"></div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Cultists</h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setViewMode('create')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${viewMode === 'create' ? 'bg-primary text-slate-900 shadow-lg shadow-primary/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            <Plus size={20} /> New Deck
          </button>
          
          <div className="pt-4 pb-2 px-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</div>

          <button 
            onClick={() => { setViewMode('dashboard'); loadDecks(user.uid); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${viewMode === 'dashboard' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <LayoutGrid size={20} /> My Decks
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors">
            <Trophy size={20} /> Leaderboard
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className="bg-slate-900 text-white rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                 </div>
                 <div className="overflow-hidden">
                    <div className="font-bold text-sm truncate">{user.email?.split('@')[0]}</div>
                    <button onClick={handleLogout} className="text-xs text-slate-400 flex items-center gap-1 hover:text-white"><LogOut size={10} /> Sign Out</button>
                 </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-bold">
                 <Flame size={14} className="fill-primary" /> 3 Day Streak
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 w-full">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 lg:hidden px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Star className="text-primary fill-primary w-6 h-6" />
            <h1 className="text-xl font-extrabold">Cultists</h1>
          </div>
          <button onClick={() => setViewMode('dashboard')} className="p-2 text-slate-600">
            <LayoutGrid size={24} />
          </button>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-8 lg:px-12 lg:py-12">
          
          {/* DASHBOARD VIEW */}
          {viewMode === 'dashboard' && (
            <>
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-black text-slate-900">My Library</h2>
                 <button onClick={() => setViewMode('create')} className="lg:hidden bg-primary text-slate-900 px-4 py-2 rounded-lg font-bold">
                   + New
                 </button>
              </div>

              {deckError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{deckError}</div>
                    <button onClick={() => loadDecks(user.uid)} className="mt-2 text-xs flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded text-amber-900 transition-colors">
                       <RefreshCw size={10} /> Retry Connection
                    </button>
                  </div>
                </div>
              )}

              <Dashboard decks={userDecks} onSelectDeck={(d) => { setStudyData(d); setViewMode('study'); }} />
            </>
          )}

          {/* CREATE VIEW */}
          {viewMode === 'create' && (
            <section className="animate-fade-in-up">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Create New Deck</h2>
                <p className="text-slate-500">Import your notes or documents to get started.</p>
              </div>

              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-1 bg-gradient-to-r from-primary via-orange-400 to-accent opacity-20"></div>
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                           <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Material</label>
                           <label className="cursor-pointer flex items-center gap-1 text-xs font-bold text-accent hover:text-accent/80 transition-colors bg-accent/10 px-3 py-1 rounded-full">
                              <Upload size={12} /> 
                              {uploadingFile ? 'Extracting...' : 'Upload PDF'}
                              <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} disabled={uploadingFile} />
                           </label>
                        </div>
                        <textarea
                          className="w-full min-h-[300px] p-4 text-slate-800 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary focus:bg-white outline-none resize-none transition-all text-base font-medium"
                          placeholder="Paste your notes here, or upload a PDF above..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          disabled={isLoading || uploadingFile}
                        />
                     </div>
                     
                     <div className="md:w-80 flex flex-col gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                          <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 focus:border-primary outline-none appearance-none cursor-pointer hover:border-slate-300 transition-colors"
                            disabled={isLoading}
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mt-auto">
                          <button
                            onClick={handleGenerate}
                            disabled={isLoading || !inputText.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all active:scale-95"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 size={24} className="animate-spin text-primary" /> Conjuring...
                              </>
                            ) : (
                              <>
                                <Sparkles size={24} className="text-primary" /> Generate Deck
                              </>
                            )}
                          </button>
                        </div>
                     </div>
                  </div>
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div> {error}
                    </div>
                  )}
                  {deckError && (
                    <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 text-sm font-bold flex items-center gap-2">
                      <AlertTriangle size={16} /> {deckError}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* STUDY VIEW */}
          {viewMode === 'study' && studyData && (
            <section className="animate-fade-in-up">
              
              {/* Header with Save Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                 <div>
                    <button onClick={() => setViewMode('dashboard')} className="text-sm font-bold text-slate-400 hover:text-slate-600 mb-1 flex items-center gap-1">
                      <LayoutGrid size={14} /> Back to Library
                    </button>
                    <div className="flex items-center gap-3">
                       <h3 className="text-2xl font-black text-slate-900">{studyData.title || "Study Session"}</h3>
                       {!studyData.id && (
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Unsaved</span>
                       )}
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {/* Manual Save Button */}
                    {!isSaved ? (
                       <button 
                          onClick={handleManualSave}
                          disabled={isSaving}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${isSaving ? 'bg-slate-100 text-slate-400' : 'bg-white border border-slate-200 text-slate-600 hover:text-primary hover:border-primary shadow-sm'}`}
                       >
                          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                          {isSaving ? "Saving..." : "Save Deck"}
                       </button>
                    ) : (
                       <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold text-sm border border-green-200">
                          <CheckCircle size={16} /> Saved
                       </div>
                    )}

                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                        {[
                          { id: 'summary', icon: FileText, label: 'Summary' },
                          { id: 'flashcards', icon: BookOpen, label: 'Cards' },
                          { id: 'quiz', icon: PlayCircle, label: 'Quiz' },
                          { id: 'json', icon: Code, label: 'Code' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                              activeTab === tab.id
                                ? 'bg-primary/20 text-slate-900'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            <tab.icon size={16} className={activeTab === tab.id ? "text-slate-900" : ""} />
                            <span>{tab.label}</span>
                          </button>
                        ))}
                    </div>
                 </div>
              </div>

              {/* Error Notification for Save Issues */}
              {deckError && (
                 <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <AlertTriangle className="text-amber-600" size={20} />
                       <span className="font-bold text-sm">{deckError}</span>
                    </div>
                    <button onClick={handleManualSave} className="text-xs bg-white border border-amber-200 px-3 py-1 rounded-lg hover:bg-amber-50 font-bold shadow-sm">
                       Retry
                    </button>
                 </div>
              )}

              <div className="min-h-[400px]">
                {activeTab === 'summary' && (
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent"></div>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 rotate-3">
                        <GraduationCap size={28} />
                      </div>
                      <h2 className="text-2xl font-extrabold text-slate-900">Key Takeaways</h2>
                    </div>
                    <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-medium">
                      <p className="whitespace-pre-line">{studyData.summary}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'flashcards' && (
                  <FlashcardViewer cards={studyData.flashcards} />
                )}

                {activeTab === 'quiz' && (
                  <QuizTaker quiz={studyData.quiz} />
                )}

                {activeTab === 'json' && (
                  <JsonView data={studyData} />
                )}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;