import Dexie, { Table } from 'dexie';
import { GameSession, UserProgress, Badge, GameType } from '@/types';

// Database interfaces
export interface DBGameSession {
  id?: number;
  sessionId: string;
  gameType: GameType;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: number;
  timeSpent: number;
  streak: number;
}

export interface DBUserStats {
  id?: number;
  totalGamesPlayed: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  bestStreak: number;
  currentStreak: number;
  lastPlayedAt: number;
  createdAt: number;
  updatedAt: number;
}

export interface DBBadge {
  id?: number;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockedAt: number;
  criteria: string; // JSON stringified criteria
}

export interface DBLevelProgress {
  id?: number;
  gameType: GameType;
  difficulty: 'easy' | 'medium' | 'hard';
  gamesPlayed: number;
  bestScore: number;
  totalCorrect: number;
  totalQuestions: number;
  updatedAt: number;
}

// Database class
export class MathGamesDB extends Dexie {
  gameSessions!: Table<DBGameSession>;
  userStats!: Table<DBUserStats>;
  badges!: Table<DBBadge>;
  levelProgress!: Table<DBLevelProgress>;

  constructor() {
    super('MathGamesDB');
    this.version(1).stores({
      gameSessions: '++id, sessionId, gameType, difficulty, completedAt',
      userStats: '++id, lastPlayedAt, updatedAt',
      badges: '++id, badgeId, unlockedAt',
      levelProgress: '++id, gameType, difficulty, updatedAt'
    });
  }
}

// Create database instance
export const db = new MathGamesDB();

// Database helper functions
export class GameStatsService {
  
  // Initialize user stats if they don't exist
  static async initializeUserStats(): Promise<void> {
    const existingStats = await db.userStats.toArray();
    if (existingStats.length === 0) {
      const now = Date.now();
      await db.userStats.add({
        totalGamesPlayed: 0,
        totalCorrectAnswers: 0,
        totalQuestions: 0,
        bestStreak: 0,
        currentStreak: 0,
        lastPlayedAt: now,
        createdAt: now,
        updatedAt: now
      });
    }
  }

  // Save a completed game session
  static async saveGameSession(session: GameSession): Promise<void> {
    const timeSpent = session.endTime ? session.endTime - session.startTime : 0;
    const correctAnswers = session.questions.filter(q => q.isCorrect).length;
    
    // Calculate streak for this session
    let streak = 0;
    let currentStreak = 0;
    session.questions.forEach(question => {
      if (question.isCorrect) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // Save game session
    await db.gameSessions.add({
      sessionId: session.id,
      gameType: session.config.type,
      difficulty: session.config.difficulty,
      score: session.score,
      totalQuestions: session.questions.length,
      correctAnswers,
      completedAt: session.endTime || Date.now(),
      timeSpent,
      streak
    });

    // Update user stats
    await this.updateUserStats(session, streak);
    
    // Update level progress
    await this.updateLevelProgress(session);
  }

  // Update overall user statistics
  private static async updateUserStats(session: GameSession, sessionStreak: number): Promise<void> {
    const currentStats = await db.userStats.orderBy('updatedAt').reverse().first();
    if (!currentStats) {
      await this.initializeUserStats();
      return this.updateUserStats(session, sessionStreak);
    }

    const correctAnswers = session.questions.filter(q => q.isCorrect).length;
    const wasAllCorrect = correctAnswers === session.questions.length;
    
    // Calculate new streak (only if all questions in session were correct)
    let newCurrentStreak = wasAllCorrect ? currentStats.currentStreak + correctAnswers : 0;

    await db.userStats.update(currentStats.id!, {
      totalGamesPlayed: currentStats.totalGamesPlayed + 1,
      totalCorrectAnswers: currentStats.totalCorrectAnswers + correctAnswers,
      totalQuestions: currentStats.totalQuestions + session.questions.length,
      bestStreak: Math.max(currentStats.bestStreak, sessionStreak, newCurrentStreak),
      currentStreak: newCurrentStreak,
      lastPlayedAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  // Update level-specific progress
  private static async updateLevelProgress(session: GameSession): Promise<void> {
    const correctAnswers = session.questions.filter(q => q.isCorrect).length;
    
    const existing = await db.levelProgress
      .where('gameType').equals(session.config.type)
      .and(item => item.difficulty === session.config.difficulty)
      .first();

    if (existing) {
      await db.levelProgress.update(existing.id!, {
        gamesPlayed: existing.gamesPlayed + 1,
        bestScore: Math.max(existing.bestScore, session.score),
        totalCorrect: existing.totalCorrect + correctAnswers,
        totalQuestions: existing.totalQuestions + session.questions.length,
        updatedAt: Date.now()
      });
    } else {
      await db.levelProgress.add({
        gameType: session.config.type,
        difficulty: session.config.difficulty,
        gamesPlayed: 1,
        bestScore: session.score,
        totalCorrect: correctAnswers,
        totalQuestions: session.questions.length,
        updatedAt: Date.now()
      });
    }
  }

  // Get user progress for display
  static async getUserProgress(): Promise<UserProgress> {
    await this.initializeUserStats();
    
    const stats = await db.userStats.orderBy('updatedAt').reverse().first();
    const badges = await db.badges.orderBy('unlockedAt').reverse().toArray();
    const levelProgress = await db.levelProgress.toArray();

    // Build level progress object
    const levelProgressObj = {
      addition: { easy: 0, medium: 0, hard: 0 },
      subtraction: { easy: 0, medium: 0, hard: 0 },
      multiplication: { easy: 0, medium: 0, hard: 0 },
      division: { easy: 0, medium: 0, hard: 0 }
    };

    levelProgress.forEach(lp => {
      levelProgressObj[lp.gameType][lp.difficulty] = lp.gamesPlayed;
    });

    // Convert DB badges to app badges
    const appBadges: Badge[] = badges.map(dbBadge => ({
      id: dbBadge.badgeId,
      name: dbBadge.name,
      description: dbBadge.description,
      icon: dbBadge.icon,
      color: dbBadge.color,
      unlockedAt: dbBadge.unlockedAt,
      criteria: JSON.parse(dbBadge.criteria)
    }));

    return {
      totalGamesPlayed: stats?.totalGamesPlayed || 0,
      totalCorrectAnswers: stats?.totalCorrectAnswers || 0,
      totalQuestions: stats?.totalQuestions || 0,
      streaks: {
        current: stats?.currentStreak || 0,
        best: stats?.bestStreak || 0
      },
      badges: appBadges,
      levelProgress: levelProgressObj
    };
  }

  // Save new badges
  static async saveBadges(badges: Badge[]): Promise<void> {
    for (const badge of badges) {
      const existing = await db.badges.where('badgeId').equals(badge.id).first();
      if (!existing && badge.unlockedAt) {
        await db.badges.add({
          badgeId: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          unlockedAt: badge.unlockedAt,
          criteria: JSON.stringify(badge.criteria)
        });
      }
    }
  }

  // Get game history
  static async getGameHistory(limit: number = 10): Promise<DBGameSession[]> {
    return await db.gameSessions
      .orderBy('completedAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  // Get statistics for a specific game type
  static async getGameTypeStats(gameType: GameType): Promise<{
    totalGames: number;
    totalCorrect: number;
    totalQuestions: number;
    averageScore: number;
    bestStreak: number;
  }> {
    const sessions = await db.gameSessions.where('gameType').equals(gameType).toArray();
    
    if (sessions.length === 0) {
      return {
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        averageScore: 0,
        bestStreak: 0
      };
    }

    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
    const totalScore = sessions.reduce((sum, s) => sum + s.score, 0);
    const bestStreak = Math.max(...sessions.map(s => s.streak));

    return {
      totalGames: sessions.length,
      totalCorrect,
      totalQuestions,
      averageScore: totalScore / sessions.length,
      bestStreak
    };
  }

  // Clear all data (for testing or reset)
  static async clearAllData(): Promise<void> {
    await db.transaction('rw', db.gameSessions, db.userStats, db.badges, db.levelProgress, () => {
      db.gameSessions.clear();
      db.userStats.clear();
      db.badges.clear();
      db.levelProgress.clear();
    });
  }
}
