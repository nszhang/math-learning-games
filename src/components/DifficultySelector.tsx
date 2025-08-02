'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameType, DifficultyLevel } from '@/types';
import { ArrowLeft, Play } from 'lucide-react';
import { getDifficultyColor } from '@/lib/gameUtils';

interface DifficultySelectorProps {
  gameType: GameType;
  onDifficultySelect: (difficulty: DifficultyLevel) => void;
  onBack: () => void;
}

const gameConfig = {
  addition: { title: 'Addition', emoji: '➕', color: 'from-green-100 to-emerald-100' },
  subtraction: { title: 'Subtraction', emoji: '➖', color: 'from-red-100 to-pink-100' },
  multiplication: { title: 'Multiplication', emoji: '✖️', color: 'from-orange-100 to-yellow-100' },
  division: { title: 'Division', emoji: '➗', color: 'from-blue-100 to-cyan-100' },
};

const difficultyLevels: { level: DifficultyLevel; description: string; details: string }[] = [
  {
    level: 'easy',
    description: 'Perfect for beginners!',
    details: 'Numbers 1-10, simple problems'
  },
  {
    level: 'medium',
    description: 'Ready for a challenge?',
    details: 'Numbers 1-50, more complex problems'
  },
  {
    level: 'hard',
    description: 'For math experts!',
    details: 'Numbers 1-100, challenging problems'
  }
];

export default function DifficultySelector({ gameType, onDifficultySelect, onBack }: DifficultySelectorProps) {
  const config = gameConfig[gameType];

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xl font-bold px-6 py-3"
          >
            <ArrowLeft size={24} className="mr-2" />
            Back
          </Button>

          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="text-8xl mb-4"
          >
            {config.emoji}
          </motion.div>

          <h1 className="text-5xl font-bold text-fun mb-2">
            {config.title} Game
          </h1>
          
          <p className="text-2xl text-gray-600 font-medium">
            Choose your difficulty level! 🎯
          </p>
        </motion.div>

        {/* Difficulty Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {difficultyLevels.map((difficulty, index) => (
            <motion.div
              key={difficulty.level}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 * index }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className={`card-fun bg-gradient-to-br ${config.color} border-4 border-white/60 cursor-pointer`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="flex flex-col items-center gap-3">
                    <Badge 
                      className={`text-xl px-4 py-2 font-bold border-2 ${getDifficultyColor(difficulty.level)}`}
                      variant="outline"
                    >
                      {difficulty.level.toUpperCase()}
                    </Badge>
                    
                    <motion.div
                      animate={{
                        bounce: [0, -10, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 2 + index * 0.5
                      }}
                      className="text-6xl"
                    >
                      {difficulty.level === 'easy' ? '🌟' : 
                       difficulty.level === 'medium' ? '🔥' : '⚡'}
                    </motion.div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {difficulty.description}
                  </h3>
                  
                  <p className="text-lg text-gray-600">
                    {difficulty.details}
                  </p>
                  
                  <Button
                    onClick={() => onDifficultySelect(difficulty.level)}
                    className="btn-fun w-full flex items-center justify-center gap-3 mt-6"
                    size="lg"
                  >
                    <Play size={24} />
                    <span>Start Playing!</span>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Fun Facts */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <Card className="card-fun bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-white/60 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                💡 Did you know?
              </h3>
              <p className="text-lg text-gray-600">
                {gameType === 'addition' && "Addition is like collecting treasures! The more you add, the bigger your collection gets! 🏴‍☠️"}
                {gameType === 'subtraction' && "Subtraction is like sharing cookies with friends! You give some away but keep the rest! 🍪"}
                {gameType === 'multiplication' && "Multiplication is like having superpowers! It makes numbers grow really fast! 🦸‍♀️"}
                {gameType === 'division' && "Division is like being fair! It helps you share things equally with everyone! ⚖️"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
