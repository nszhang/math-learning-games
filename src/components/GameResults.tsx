'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GameSession, Badge as BadgeType } from '@/types';
import { Home, RotateCcw, Trophy, Clock, Target, Star } from 'lucide-react';
import { calculateScore } from '@/lib/gameUtils';

interface GameResultsProps {
  session: GameSession;
  newBadges: BadgeType[];
  onPlayAgain: () => void;
  onBackToHome: () => void;
}

export default function GameResults({ session, newBadges, onPlayAgain, onBackToHome }: GameResultsProps) {
  const score = calculateScore(session.questions);
  const timeSpent = session.endTime ? Math.round((session.endTime - session.startTime) / 1000) : 0;
  const averageTime = session.questions.length > 0 ? Math.round(timeSpent / session.questions.length) : 0;

  const getPerformanceEmoji = (percentage: number) => {
    if (percentage === 100) return '🌟';
    if (percentage >= 80) return '🎉';
    if (percentage >= 60) return '👍';
    if (percentage >= 40) return '💪';
    return '🎯';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage === 100) return 'Perfect! You\'re a math superstar! 🌟';
    if (percentage >= 80) return 'Excellent work! Keep it up! 🎉';
    if (percentage >= 60) return 'Good job! You\'re getting better! 👍';
    if (percentage >= 40) return 'Nice try! Practice makes perfect! 💪';
    return 'Don\'t give up! You can do it! 🎯';
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-8xl mb-4"
          >
            {getPerformanceEmoji(score.percentage)}
          </motion.div>

          <h1 className="text-5xl font-bold text-fun mb-2">
            Game Complete!
          </h1>
          
          <p className="text-2xl text-gray-600 font-medium">
            {getPerformanceMessage(score.percentage)}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Score Card */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-fun bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-white/60">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                  <Trophy className="text-yellow-500" size={36} />
                  Your Score
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center space-y-6">
                <div className="text-6xl font-bold text-green-600">
                  {score.correct}/{score.total}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Accuracy</span>
                    <span className="text-2xl font-bold text-green-600">
                      {score.percentage}%
                    </span>
                  </div>
                  <Progress value={score.percentage} className="h-4 progress-fun" />
                </div>
                
                {score.streak > 0 && (
                  <div className="bg-white/60 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Best Streak</span>
                      <span className="text-2xl font-bold text-orange-600">
                        {score.streak} 🔥
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-fun bg-gradient-to-br from-blue-100 to-cyan-100 border-4 border-white/60">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                  <Clock className="text-blue-500" size={36} />
                  Time Stats
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/60 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Total Time
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {averageTime}s
                    </div>
                    <div className="text-sm text-gray-600 font-medium">
                      Per Question
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Game Type</span>
                    <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2 font-bold">
                      {session.config.type.charAt(0).toUpperCase() + session.config.type.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="bg-white/60 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Difficulty</span>
                    <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2 font-bold">
                      {session.config.difficulty.charAt(0).toUpperCase() + session.config.difficulty.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* New Badges */}
        {newBadges.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="card-fun bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-white/60">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
                  <Star className="text-yellow-500" size={36} />
                  New Badges Earned!
                </CardTitle>
              </CardHeader>
              
              <CardContent className="text-center">
                <div className="flex gap-4 justify-center flex-wrap">
                  {newBadges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + index * 0.2, type: "spring", stiffness: 300 }}
                      className="star-pop"
                    >
                      <div className="bg-white/80 rounded-2xl p-6 text-center">
                        <div className="text-4xl mb-2">{badge.icon}</div>
                        <div className="font-bold text-xl text-gray-800">{badge.name}</div>
                        <div className="text-sm text-gray-600">{badge.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-4 justify-center flex-wrap"
        >
          <Button
            onClick={onPlayAgain}
            className="btn-fun text-2xl py-6 px-12 flex items-center gap-4"
          >
            <RotateCcw size={32} />
            <span>Play Again!</span>
          </Button>
          
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-2xl font-bold py-6 px-12 flex items-center gap-4"
          >
            <Home size={32} />
            <span>Home</span>
          </Button>
        </motion.div>

        {/* Question Review (collapsed by default) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <Card className="card-fun bg-gradient-to-br from-purple-100 to-pink-100 border-4 border-white/60">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                📊 Question Review
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {session.questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-xl flex items-center justify-between ${
                      question.isCorrect 
                        ? 'bg-green-100 border-2 border-green-200' 
                        : 'bg-red-100 border-2 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {question.isCorrect ? '✅' : '❌'}
                      </span>
                      <span className="font-medium">
                        Question {index + 1}: {question.num1} {question.operation === 'addition' ? '+' : question.operation === 'subtraction' ? '-' : question.operation === 'multiplication' ? '×' : '÷'} {question.num2}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        Your answer: {question.userAnswer ?? 'No answer'}
                      </div>
                      {!question.isCorrect && (
                        <div className="text-sm text-gray-600">
                          Correct: {question.correctAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
