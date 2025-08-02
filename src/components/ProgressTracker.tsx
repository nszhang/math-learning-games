'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { UserProgress } from '@/types';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

interface ProgressTrackerProps {
  progress: UserProgress;
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const accuracyPercentage = progress.totalQuestions > 0 
    ? Math.round((progress.totalCorrectAnswers / progress.totalQuestions) * 100)
    : 0;

  const recentBadges = progress.badges
    .filter(badge => badge.unlockedAt)
    .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
    .slice(0, 3);

  return (
    <Card className="card-fun bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-white/60">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-3xl font-bold text-fun flex items-center justify-center gap-3">
          <Trophy className="text-yellow-500" size={36} />
          Your Progress
          <Trophy className="text-yellow-500" size={36} />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/60 rounded-2xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-blue-600">
              {progress.totalGamesPlayed}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Games Played
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white/60 rounded-2xl p-4 text-center"
          >
            <div className="text-3xl font-bold text-green-600">
              {accuracyPercentage}%
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Accuracy
            </div>
          </motion.div>
        </div>

        {/* Current Streak */}
        <div className="bg-white/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-lg flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={24} />
              Current Streak
            </span>
            <span className="text-2xl font-bold text-orange-600">
              {progress.streaks.current} 🔥
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Best: {progress.streaks.best} correct in a row!
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-3">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <Target className="text-purple-500" size={24} />
            Level Progress
          </h4>
          
          {Object.entries(progress.levelProgress).map(([gameType, levels]) => {
            const totalProgress = levels.easy + levels.medium + levels.hard;
            const maxProgress = 30; // 10 per difficulty level
            const percentage = Math.min((totalProgress / maxProgress) * 100, 100);
            
            return (
              <div key={gameType} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize text-gray-700">
                    {gameType}
                  </span>
                  <span className="text-sm text-gray-600">
                    {totalProgress}/{maxProgress}
                  </span>
                </div>
                <Progress value={percentage} className="h-3 progress-fun" />
              </div>
            );
          })}
        </div>

        {/* Recent Badges */}
        {recentBadges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-bold text-lg flex items-center gap-2">
              <Star className="text-yellow-500" size={24} />
              Recent Badges
            </h4>
            
            <div className="flex gap-2 flex-wrap">
              {recentBadges.map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="star-pop"
                >
                  <Badge
                    variant="secondary"
                    className={`${badge.color} text-white font-bold px-3 py-2 text-sm`}
                  >
                    {badge.icon} {badge.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
