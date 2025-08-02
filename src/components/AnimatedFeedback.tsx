'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AnimationState } from '@/types';
import { CheckCircle, XCircle, Star, Trophy } from 'lucide-react';

interface AnimatedFeedbackProps {
  animation: AnimationState;
  onAnimationComplete?: () => void;
}

export default function AnimatedFeedback({ animation, onAnimationComplete }: AnimatedFeedbackProps) {
  if (!animation.isVisible) return null;

  const getAnimationContent = () => {
    switch (animation.type) {
      case 'correct':
        return {
          icon: <CheckCircle size={80} className="text-green-500" />,
          message: animation.message || 'Great job! 🎉',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          emoji: '🎉',
        };
      case 'incorrect':
        return {
          icon: <XCircle size={80} className="text-red-500" />,
          message: animation.message || 'Try again! 💪',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          emoji: '💪',
        };
      case 'badge':
        return {
          icon: <Trophy size={80} className="text-yellow-500" />,
          message: animation.message || 'New Badge Earned!',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          emoji: '🏆',
        };
      case 'celebration':
        return {
          icon: <Star size={80} className="text-purple-500" />,
          message: animation.message || 'Amazing! 🌟',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          emoji: '🌟',
        };
      default:
        return null;
    }
  };

  const content = getAnimationContent();
  if (!content) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          rotate: [0, -5, 5, -5, 0],
        }}
        exit={{ opacity: 0, scale: 0.5, y: -50 }}
        transition={{ 
          duration: 0.5,
          rotate: { duration: 1, repeat: 2 }
        }}
        onAnimationComplete={() => {
          setTimeout(() => {
            onAnimationComplete?.();
          }, 2000);
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      >
        <motion.div
          className={`${content.bgColor} ${content.textColor} rounded-3xl p-8 text-center shadow-2xl border-4 border-white max-w-md mx-4`}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            scale: { duration: 0.8, repeat: Infinity, repeatDelay: 1 }
          }}
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="mb-4"
          >
            {content.icon}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <div className="text-6xl">{content.emoji}</div>
            <h2 className="text-3xl font-bold">{content.message}</h2>
            
            {animation.badge && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                className="bg-white/80 rounded-2xl p-4 mt-4"
              >
                <div className="text-4xl mb-2">{animation.badge.icon}</div>
                <div className="font-bold text-xl">{animation.badge.name}</div>
                <div className="text-sm opacity-80">{animation.badge.description}</div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
        
        {/* Confetti effect for celebrations */}
        {(animation.type === 'correct' || animation.type === 'celebration' || animation.type === 'badge') && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: "50vw",
                  y: "50vh",
                }}
                animate={{
                  opacity: [1, 1, 0],
                  scale: [0, 1, 0.5],
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: "easeOut"
                }}
                className="absolute text-2xl"
              >
                {['🎉', '⭐', '🌟', '✨', '🎊'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
