'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameStatsService, DBGameSession } from '@/lib/database';
import { GameType } from '@/types';
import { ArrowLeft, BarChart3, History, Trophy, TrendingUp } from 'lucide-react';

interface StatsPageProps {
  onBack: () => void;
}

export default function StatsPage({ onBack }: StatsPageProps) {
  const [gameHistory, setGameHistory] = useState<DBGameSession[]>([]);
  const [gameTypeStats, setGameTypeStats] = useState<Record<GameType, any>>({
    addition: null,
    subtraction: null,
    multiplication: null,
    division: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load game history
        const history = await GameStatsService.getGameHistory(20);
        setGameHistory(history);

        // Load stats for each game type
        const stats: any = {};
        for (const gameType of ['addition', 'subtraction', 'multiplication', 'division'] as GameType[]) {
          stats[gameType] = await GameStatsService.getGameTypeStats(gameType);
        }
        setGameTypeStats(stats);
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  const getGameTypeEmoji = (gameType: GameType) => {
    const emojis = {
      addition: '➕',
      subtraction: '➖',
      multiplication: '✖️',
      division: '➗'
    };
    return emojis[gameType];
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-4xl">Loading stats... 📊</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xl font-bold px-6 py-3"
          >
            <ArrowLeft size={24} className="mr-2" />
            Back
          </Button>

          <h1 className="text-5xl font-bold text-fun flex items-center gap-3">
            <BarChart3 size={48} className="text-purple-600" />
            Your Statistics
          </h1>

          <div className="w-32" /> {/* Spacer for centering */}
        </motion.div>

        {/* Game Type Statistics */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {Object.entries(gameTypeStats).map(([gameType, stats]) => (
            <Card key={gameType} className="card-fun bg-gradient-to-br from-white to-blue-50 border-4 border-white/60">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  <span className="text-3xl">{getGameTypeEmoji(gameType as GameType)}</span>
                  {gameType.charAt(0).toUpperCase() + gameType.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/60 rounded-xl p-2 text-center">
                    <div className="font-bold text-blue-600">{stats?.totalGames || 0}</div>
                    <div className="text-gray-600">Games</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-2 text-center">
                    <div className="font-bold text-green-600">
                      {stats?.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
                    </div>
                    <div className="text-gray-600">Accuracy</div>
                  </div>
                </div>
                <div className="bg-white/60 rounded-xl p-2 text-center">
                  <div className="font-bold text-orange-600">{stats?.bestStreak || 0}</div>
                  <div className="text-gray-600">Best Streak</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Recent Games History */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="card-fun bg-gradient-to-br from-white to-purple-50 border-4 border-white/60">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <History size={36} className="text-purple-600" />
                Recent Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gameHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-xl">No games played yet!</p>
                  <p>Start playing to see your history here.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {gameHistory.map((session) => (
                    <motion.div
                      key={session.sessionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white/60 rounded-xl p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{getGameTypeEmoji(session.gameType)}</div>
                        <div>
                          <div className="font-bold text-gray-800 capitalize">
                            {session.gameType}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Badge className={`${getDifficultyColor(session.difficulty)} text-xs px-2 py-1`}>
                              {session.difficulty.toUpperCase()}
                            </Badge>
                            <span>{formatDate(session.completedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-800">
                          {session.score}/{session.totalQuestions}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <TrendingUp size={14} />
                          <span>{session.streak} streak</span>
                          <span>•</span>
                          <span>{formatDuration(session.timeSpent)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
