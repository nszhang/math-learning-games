import { GameType, DifficultyLevel, Question, GameConfig, Badge } from '@/types';

export function generateQuestion(gameType: GameType, difficulty: DifficultyLevel): Question {
  let num1: number, num2: number, correctAnswer: number;
  
  const difficultyRanges = {
    easy: { min: 1, max: 10 },
    medium: { min: 1, max: 50 },
    hard: { min: 1, max: 100 }
  };
  
  const range = difficultyRanges[difficulty];
  
  switch (gameType) {
    case 'addition':
      num1 = Math.floor(Math.random() * range.max) + range.min;
      num2 = Math.floor(Math.random() * range.max) + range.min;
      correctAnswer = num1 + num2;
      break;
      
    case 'subtraction':
      // Ensure positive results for children
      num1 = Math.floor(Math.random() * range.max) + range.min;
      num2 = Math.floor(Math.random() * num1) + 1;
      correctAnswer = num1 - num2;
      break;
      
    case 'multiplication':
      const multRange = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 12;
      num1 = Math.floor(Math.random() * multRange) + 1;
      num2 = Math.floor(Math.random() * multRange) + 1;
      correctAnswer = num1 * num2;
      break;
      
    case 'division':
      // Generate division that results in whole numbers
      const divRange = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 12;
      num2 = Math.floor(Math.random() * divRange) + 1;
      const quotient = Math.floor(Math.random() * divRange) + 1;
      num1 = num2 * quotient;
      correctAnswer = quotient;
      break;
      
    default:
      throw new Error(`Unknown game type: ${gameType}`);
  }
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    num1,
    num2,
    operation: gameType,
    correctAnswer
  };
}

export function generateQuestions(config: GameConfig): Question[] {
  const questions: Question[] = [];
  
  for (let i = 0; i < config.questionCount; i++) {
    questions.push(generateQuestion(config.type, config.difficulty));
  }
  
  return questions;
}

export function getOperationSymbol(gameType: GameType): string {
  const symbols = {
    addition: '+',
    subtraction: '-',
    multiplication: '×',
    division: '÷'
  };
  return symbols[gameType];
}

export function formatQuestion(question: Question): string {
  const symbol = getOperationSymbol(question.operation);
  return `${question.num1} ${symbol} ${question.num2} = ?`;
}

export function calculateScore(questions: Question[]): {
  correct: number;
  total: number;
  percentage: number;
  streak: number;
} {
  const correct = questions.filter(q => q.isCorrect).length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  
  // Calculate longest streak
  let currentStreak = 0;
  let maxStreak = 0;
  
  questions.forEach(question => {
    if (question.isCorrect) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return {
    correct,
    total,
    percentage,
    streak: maxStreak
  };
}

export function checkForNewBadges(
  score: { correct: number; total: number; percentage: number; streak: number },
  gameType: GameType,
  currentBadges: Badge[]
): Badge[] {
  const newBadges: Badge[] = [];
  const unlockedBadgeIds = new Set(currentBadges.map(b => b.id));
  
  // Define available badges
  const availableBadges: Badge[] = [
    {
      id: 'first_game',
      name: 'First Steps',
      description: 'Completed your first game!',
      icon: '🎯',
      color: 'bg-blue-500',
      criteria: { type: 'games_played', value: 1 }
    },
    {
      id: 'perfect_game',
      name: 'Perfect Score',
      description: 'Got 100% in a game!',
      icon: '⭐',
      color: 'bg-yellow-500',
      criteria: { type: 'perfect_game', value: 100 }
    },
    {
      id: 'streak_5',
      name: 'Hot Streak',
      description: '5 correct answers in a row!',
      icon: '🔥',
      color: 'bg-orange-500',
      criteria: { type: 'streak', value: 5 }
    },
    {
      id: 'streak_10',
      name: 'Super Streak',
      description: '10 correct answers in a row!',
      icon: '⚡',
      color: 'bg-purple-500',
      criteria: { type: 'streak', value: 10 }
    },
    {
      id: 'addition_master',
      name: 'Addition Master',
      description: 'Perfect score in addition!',
      icon: '➕',
      color: 'bg-green-500',
      criteria: { type: 'perfect_game', value: 100, gameType: 'addition' }
    },
    {
      id: 'subtraction_master',
      name: 'Subtraction Master',
      description: 'Perfect score in subtraction!',
      icon: '➖',
      color: 'bg-red-500',
      criteria: { type: 'perfect_game', value: 100, gameType: 'subtraction' }
    },
    {
      id: 'multiplication_master',
      name: 'Multiplication Master',
      description: 'Perfect score in multiplication!',
      icon: '✖️',
      color: 'bg-orange-500',
      criteria: { type: 'perfect_game', value: 100, gameType: 'multiplication' }
    },
    {
      id: 'division_master',
      name: 'Division Master',
      description: 'Perfect score in division!',
      icon: '➗',
      color: 'bg-blue-500',
      criteria: { type: 'perfect_game', value: 100, gameType: 'division' }
    }
  ];
  
  availableBadges.forEach(badge => {
    if (unlockedBadgeIds.has(badge.id)) return;
    
    let shouldUnlock = false;
    
    switch (badge.criteria.type) {
      case 'perfect_game':
        shouldUnlock = score.percentage >= badge.criteria.value &&
          (!badge.criteria.gameType || badge.criteria.gameType === gameType);
        break;
      case 'streak':
        shouldUnlock = score.streak >= badge.criteria.value;
        break;
      case 'games_played':
        shouldUnlock = true; // This would be checked against total games played
        break;
    }
    
    if (shouldUnlock) {
      newBadges.push({
        ...badge,
        unlockedAt: Date.now()
      });
    }
  });
  
  return newBadges;
}

export function getEncouragingMessage(isCorrect: boolean, streak: number): string {
  if (isCorrect) {
    const messages = [
      "Great job! 🎉",
      "Awesome! 🌟",
      "Perfect! ✨",
      "Well done! 🎊",
      "Fantastic! 🏆",
      "You're amazing! 🎯",
      "Keep it up! 💪",
      "Brilliant! 🧠"
    ];
    
    if (streak >= 5) {
      return `Amazing streak! ${streak} in a row! 🔥`;
    }
    
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    const messages = [
      "Try again! 💪",
      "Almost there! 🎯",
      "Keep going! 🌟",
      "You can do it! ✨",
      "Don't give up! 🚀",
      "Practice makes perfect! 📚"
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }
}

export function getDifficultyColor(difficulty: DifficultyLevel): string {
  const colors = {
    easy: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    hard: 'bg-red-100 text-red-800 border-red-200'
  };
  return colors[difficulty];
}
