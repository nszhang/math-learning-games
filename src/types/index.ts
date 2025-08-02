export type GameType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  type: GameType;
  difficulty: DifficultyLevel;
  timeLimit?: number;
  questionCount: number;
}

export interface Question {
  id: string;
  num1: number;
  num2: number;
  operation: GameType;
  correctAnswer: number;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

export interface GameSession {
  id: string;
  config: GameConfig;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
}

export interface UserProgress {
  totalGamesPlayed: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  streaks: {
    current: number;
    best: number;
  };
  badges: Badge[];
  levelProgress: {
    [key in GameType]: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt?: number;
  criteria: {
    type: 'streak' | 'total_correct' | 'perfect_game' | 'speed' | 'games_played';
    value: number;
    gameType?: GameType;
  };
}

export interface AnimationState {
  isVisible: boolean;
  type: 'correct' | 'incorrect' | 'badge' | 'celebration';
  message?: string;
  badge?: Badge;
}
