'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameCard from './GameCard';
import ProgressTracker from './ProgressTracker';
import { GameType, UserProgress } from '@/types';
import { Button } from '@/components/ui/button';
import { Home, Settings, HelpCircle, BarChart3 } from 'lucide-react';
import { GameStatsService } from '@/lib/database';

interface DashboardProps {
  onGameSelect: (gameType: GameType) => void;
  onViewStats?: () => void;
}

export default function Dashboard({ onGameSelect, onViewStats }: DashboardProps) {
  const [progress, setProgress] = useState<UserProgress>({
    totalGamesPlayed: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
    streaks: { current: 0, best: 0 },
    badges: [],
    levelProgress: {
      addition: { easy: 0, medium: 0, hard: 0 },
      subtraction: { easy: 0, medium: 0, hard: 0 },
      multiplication: { easy: 0, medium: 0, hard: 0 },
      division: { easy: 0, medium: 0, hard: 0 },
    }
  });

  useEffect(() => {
    // Load progress from IndexedDB
    const loadProgress = async () => {
      try {
        const userProgress = await GameStatsService.getUserProgress();
        setProgress(userProgress);
      } catch (error) {
        console.error('Failed to load user progress:', error);
      }
    };
    
    loadProgress();
  }, []);

  const gameTypes: GameType[] = ['addition', 'subtraction', 'multiplication', 'division'];

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <motion.h1
          className="text-6xl font-bold text-fun mb-4"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          🧮 Math Fun Games 🎲
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl text-gray-600 font-medium"
        >
          Learn math through play! 🌟
        </motion.p>
      </motion.header>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Games Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                🎮 Choose Your Game
              </h2>
              <p className="text-xl text-gray-600">
                Pick a math game to start learning!
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {gameTypes.map((gameType, index) => (
                <motion.div
                  key={gameType}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 * index }}
                >
                  <GameCard
                    gameType={gameType}
                    onPlay={onGameSelect}
                    isLocked={false}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <ProgressTracker progress={progress} />
            </motion.div>
          </div>
        </div>

        {/* Navigation Footer */}
        <motion.footer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center gap-4"
        >
          <Button
            size="lg"
            className="btn-fun flex items-center gap-3"
          >
            <Home size={24} />
            <span className="hidden sm:inline">Home</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xl font-bold px-8 py-4 flex items-center gap-3"
          >
            <Settings size={24} />
            <span className="hidden sm:inline">Settings</span>
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xl font-bold px-8 py-4 flex items-center gap-3"
          >
            <HelpCircle size={24} />
            <span className="hidden sm:inline">Help</span>
          </Button>
          
          {onViewStats && (
            <Button
              size="lg"
              variant="outline"
              onClick={onViewStats}
              className="bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-xl font-bold px-8 py-4 flex items-center gap-3"
            >
              <BarChart3 size={24} />
              <span className="hidden sm:inline">Statistics</span>
            </Button>
          )}
        </motion.footer>
      </div>
    </div>
  );
}
