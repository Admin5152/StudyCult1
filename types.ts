export enum Difficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard"
}

export interface Flashcard {
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export enum QuestionType {
  MultipleChoice = "multiple_choice",
  ShortAnswer = "short_answer"
}

export interface QuizQuestion {
  type: QuestionType;
  question: string;
  options?: string[]; // Only for multiple_choice
  correct_answer?: string; // For multiple_choice
  ideal_answer?: string; // For short_answer
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface StudySet {
  id?: string;        // Firebase Doc ID
  userId?: string;    // Owner ID
  createdAt?: number; // Timestamp
  title?: string;     // Title of the deck (e.g. from filename or topic)
  category?: string;
  summary: string;
  flashcards: Flashcard[];
  quiz: Quiz;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
}
