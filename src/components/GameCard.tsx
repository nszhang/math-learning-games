'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GameType } from '@/types';
import { Plus, Minus, X, Divide } from 'lucide-react';

interface GameCardProps {
  gameType: GameType;
  onPlay: (gameType: GameType) => void;
  isLocked?: boolean;
}

const gameConfig = {
  addition: {
    title: 'Addition',
    emoji: '➕',
    icon: Plus,
    description: 'Add numbers together!',
    color: 'btn-addition',
    bgGradient: 'from-green-100 to-emerald-100',
  },
  subtraction: {
    title: 'Subtraction', 
    emoji: '➖',
    icon: Minus,
    description: 'Take numbers away!',
    color: 'btn-subtraction',
    bgGradient: 'from-red-100 to-pink-100',
  },
  multiplication: {
    title: 'Multiplication',
    emoji: '✖️',
    icon: X,
    description: 'Times tables fun!',
    color: 'btn-multiplication',
    bgGradient: 'from-orange-100 to-yellow-100',
  },
  division: {
    title: 'Division',
    emoji: '➗',
    icon: Divide,
    description: 'Share equally!',
    color: 'btn-division',
    bgGradient: 'from-blue-100 to-cyan-100',
  },
};

export default function GameCard({ gameType, onPlay, isLocked = false }: GameCardProps) {
  console.log('🃏 GameCard: Rendering card for', gameType);
  console.log('🃏 GameCard: onPlay function =', typeof onPlay);
  console.log('🃏 GameCard: isLocked =', isLocked);
  
  const config = gameConfig[gameType];
  const IconComponent = config.icon;
  
  console.log('🃏 GameCard: Config =', config);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <Card className={`card-fun bg-gradient-to-br ${config.bgGradient} border-4 border-white/60 relative overflow-hidden`}>
        {isLocked && (
          <div className="absolute inset-0 bg-gray-500/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-6xl">🔒</div>
          </div>
        )}
        
        <CardContent className="p-8 text-center">
          <motion.div
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
              scale: [1, 1.05, 1]
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
          
          <h3 className="text-3xl font-bold text-gray-800 mb-2">
            {config.title}
          </h3>
          
          <p className="text-xl text-gray-600 mb-6">
            {config.description}
          </p>
          
          <Button
            onClick={() => {
              console.log('🃏 GameCard: Play button clicked for', gameType);
              console.log('🃏 GameCard: Calling onPlay with', gameType);
              onPlay(gameType);
              console.log('🃏 GameCard: onPlay called successfully');
            }}
            disabled={isLocked}
            className={`btn-game ${config.color} w-full flex items-center justify-center gap-3`}
          >
            <IconComponent size={32} />
            <span>Play Now!</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
