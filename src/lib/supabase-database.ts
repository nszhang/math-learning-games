import { createClient } from '@/lib/supabase/client';
import { GameSession, UserProgress, Badge, GameType } from '@/types';
import { User } from '@supabase/supabase-js';

// Supabase table interfaces
export interface SupabaseGameSession {
  id?: number;
  user_id: string;
  session_id: string;
  game_type: GameType;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  total_questions: number;
  correct_answers: number;
  completed_at: string;
  time_spent: number;
  streak: number;
  created_at?: string;
}

export interface SupabaseUserStats {
  id?: number;
  user_id: string;
  total_games_played: number;
  total_correct_answers: number;
  total_questions: number;
  best_streak: number;
  current_streak: number;
  last_played_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseBadge {
  id?: number;
  user_id: string;
  badge_id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked_at: string;
  criteria: Record<string, unknown>; // JSONB field
  created_at?: string;
}

export interface SupabaseLevelProgress {
  id?: number;
  user_id: string;
  game_type: GameType;
  difficulty: 'easy' | 'medium' | 'hard';
  games_played: number;
  best_score: number;
  total_correct: number;
  total_questions: number;
  updated_at?: string;
  created_at?: string;
}

export class SupabaseGameStatsService {
  private static supabase = createClient();

  // Initialize user stats if they don't exist
  static async initializeUserStats(user: User): Promise<void> {
    const { data: existingStats } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!existingStats) {
      const now = new Date().toISOString();
      await this.supabase.from('user_stats').insert({
        user_id: user.id,
        total_games_played: 0,
        total_correct_answers: 0,
        total_questions: 0,
        best_streak: 0,
        current_streak: 0,
        last_played_at: now,
        created_at: now,
        updated_at: now
      });
    }
  }

  // Save a completed game session
  static async saveGameSession(session: GameSession, user: User): Promise<void> {
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
    await this.supabase.from('game_sessions').insert({
      user_id: user.id,
      session_id: session.id,
      game_type: session.config.type,
      difficulty: session.config.difficulty,
      score: session.score,
      total_questions: session.questions.length,
      correct_answers: correctAnswers,
      completed_at: new Date(session.endTime || Date.now()).toISOString(),
      time_spent: timeSpent,
      streak
    });

    // Update user stats
    await this.updateUserStats(session, streak, user);
    
    // Update level progress
    await this.updateLevelProgress(session, user);
  }

  // Update overall user statistics
  private static async updateUserStats(session: GameSession, sessionStreak: number, user: User): Promise<void> {
    await this.initializeUserStats(user);
    
    const { data: currentStats } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!currentStats) return;

    const correctAnswers = session.questions.filter(q => q.isCorrect).length;
    const wasAllCorrect = correctAnswers === session.questions.length;
    
    // Calculate new streak (only if all questions in session were correct)
    const newCurrentStreak = wasAllCorrect ? currentStats.current_streak + correctAnswers : 0;

    await this.supabase
      .from('user_stats')
      .update({
        total_games_played: currentStats.total_games_played + 1,
        total_correct_answers: currentStats.total_correct_answers + correctAnswers,
        total_questions: currentStats.total_questions + session.questions.length,
        best_streak: Math.max(currentStats.best_streak, sessionStreak, newCurrentStreak),
        current_streak: newCurrentStreak,
        last_played_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
  }

  // Update level-specific progress
  private static async updateLevelProgress(session: GameSession, user: User): Promise<void> {
    const correctAnswers = session.questions.filter(q => q.isCorrect).length;
    
    const { data: existing } = await this.supabase
      .from('level_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_type', session.config.type)
      .eq('difficulty', session.config.difficulty)
      .single();

    if (existing) {
      await this.supabase
        .from('level_progress')
        .update({
          games_played: existing.games_played + 1,
          best_score: Math.max(existing.best_score, session.score),
          total_correct: existing.total_correct + correctAnswers,
          total_questions: existing.total_questions + session.questions.length,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await this.supabase.from('level_progress').insert({
        user_id: user.id,
        game_type: session.config.type,
        difficulty: session.config.difficulty,
        games_played: 1,
        best_score: session.score,
        total_correct: correctAnswers,
        total_questions: session.questions.length,
        updated_at: new Date().toISOString()
      });
    }
  }

  // Get user progress for display
  static async getUserProgress(user: User): Promise<UserProgress> {
    await this.initializeUserStats(user);
    
    const { data: stats } = await this.supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: badges } = await this.supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false });

    const { data: levelProgress } = await this.supabase
      .from('level_progress')
      .select('*')
      .eq('user_id', user.id);

    // Build level progress object
    const levelProgressObj = {
      addition: { easy: 0, medium: 0, hard: 0 },
      subtraction: { easy: 0, medium: 0, hard: 0 },
      multiplication: { easy: 0, medium: 0, hard: 0 },
      division: { easy: 0, medium: 0, hard: 0 }
    };

    levelProgress?.forEach(lp => {
      levelProgressObj[lp.game_type][lp.difficulty] = lp.games_played;
    });

    // Convert Supabase badges to app badges
    const appBadges: Badge[] = badges?.map(dbBadge => ({
      id: dbBadge.badge_id,
      name: dbBadge.name,
      description: dbBadge.description,
      icon: dbBadge.icon,
      color: dbBadge.color,
      unlockedAt: new Date(dbBadge.unlocked_at).getTime(),
      criteria: dbBadge.criteria
    })) || [];

    return {
      totalGamesPlayed: stats?.total_games_played || 0,
      totalCorrectAnswers: stats?.total_correct_answers || 0,
      totalQuestions: stats?.total_questions || 0,
      streaks: {
        current: stats?.current_streak || 0,
        best: stats?.best_streak || 0
      },
      badges: appBadges,
      levelProgress: levelProgressObj
    };
  }

  // Save new badges
  static async saveBadges(badges: Badge[], user: User): Promise<void> {
    for (const badge of badges) {
      const { data: existing } = await this.supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id)
        .eq('badge_id', badge.id)
        .single();

      if (!existing && badge.unlockedAt) {
        await this.supabase.from('badges').insert({
          user_id: user.id,
          badge_id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          unlocked_at: new Date(badge.unlockedAt).toISOString(),
          criteria: badge.criteria
        });
      }
    }
  }

  // Get game history
  static async getGameHistory(user: User, limit: number = 10): Promise<SupabaseGameSession[]> {
    const { data } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  // Get statistics for a specific game type
  static async getGameTypeStats(gameType: GameType, user: User): Promise<{
    totalGames: number;
    totalCorrect: number;
    totalQuestions: number;
    averageScore: number;
    bestStreak: number;
  }> {
    const { data: sessions } = await this.supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_type', gameType);
    
    if (!sessions || sessions.length === 0) {
      return {
        totalGames: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        averageScore: 0,
        bestStreak: 0
      };
    }

    const totalCorrect = sessions.reduce((sum, s) => sum + s.correct_answers, 0);
    const totalQuestions = sessions.reduce((sum, s) => sum + s.total_questions, 0);
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
}
