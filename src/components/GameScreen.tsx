'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import AnimatedFeedback from './AnimatedFeedback';
import { GameConfig, Question, GameSession, AnimationState } from '@/types';
import { ArrowLeft, Clock, Trophy, Target } from 'lucide-react';
import { 
  generateQuestions, 
  formatQuestion, 
  calculateScore, 
  checkForNewBadges,
  getEncouragingMessage 
} from '@/lib/gameUtils';

interface GameScreenProps {
  config: GameConfig;
  onGameComplete: (session: GameSession) => void;
  onBack: () => void;
}

export default function GameScreen({ config, onGameComplete, onBack }: GameScreenProps) {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [animation, setAnimation] = useState<AnimationState>({ isVisible: false, type: 'correct' });
  const [streak, setStreak] = useState(0);
  const [feedbackColor, setFeedbackColor] = useState<string>('');

  // Audio feedback function
  const playAudioFeedback = useCallback((isCorrect: boolean) => {
    // Create audio context for sound feedback
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (isCorrect) {
      // Correct answer: pleasant ascending tone
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    } else {
      // Wrong answer: gentle descending tone
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    }
    
    oscillator.type = 'sine';
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  // Quick visual feedback function
  const showQuickFeedback = useCallback((isCorrect: boolean) => {
    setFeedbackColor(isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50');
    setTimeout(() => setFeedbackColor(''), 800); // Reset after 800ms
  }, []);

  // Initialize game session
  useEffect(() => {
    const questions = generateQuestions(config);
    const newSession: GameSession = {
      id: Math.random().toString(36).substr(2, 9),
      config,
      questions,
      currentQuestionIndex: 0,
      score: 0,
      startTime: Date.now(),
      isCompleted: false
    };
    setSession(newSession);
    
    if (config.timeLimit) {
      setTimeLeft(config.timeLimit);
    }
  }, [config]);

  // Use ref to store submit function to avoid dependency issues
  const submitAnswerRef = useRef<() => void>();
  
  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || !session || session.isCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          if (submitAnswerRef.current) {
            submitAnswerRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft, session]);

  const getCurrentQuestion = useCallback((): Question | null => {
    if (!session || session.currentQuestionIndex >= session.questions.length) {
      return null;
    }
    return session.questions[session.currentQuestionIndex];
  }, [session]);

  const handleSubmitAnswer = useCallback(() => {
    if (!session) return;
    
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    const userAnswer = parseInt(currentAnswer) || 0;
    const isCorrect = userAnswer === currentQuestion.correctAnswer;
    
    // Update question with user answer
    const updatedQuestions = [...session.questions];
    updatedQuestions[session.currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer,
      isCorrect,
      timeSpent: config.timeLimit ? (config.timeLimit - (timeLeft || 0)) : undefined
    };
    
    // Update streak
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    
    // Play audio feedback instead of showing animation
    playAudioFeedback(isCorrect);
    
    // Show brief visual feedback in the answer area
    showQuickFeedback(isCorrect);
    
    // Update session
    const updatedSession: GameSession = {
      ...session,
      questions: updatedQuestions,
      score: isCorrect ? session.score + 1 : session.score,
      currentQuestionIndex: session.currentQuestionIndex + 1,
      isCompleted: session.currentQuestionIndex + 1 >= session.questions.length
    };
    
    if (updatedSession.isCompleted) {
      updatedSession.endTime = Date.now();
    }
    
    setSession(updatedSession);
    setCurrentAnswer('');
    
    // Reset timer if there's a time limit
    if (config.timeLimit && !updatedSession.isCompleted) {
      setTimeLeft(config.timeLimit);
    }
  }, [session, currentAnswer, timeLeft, config.timeLimit, streak, getCurrentQuestion, playAudioFeedback, showQuickFeedback]);

  // Update ref to point to the submit function
  useEffect(() => {
    submitAnswerRef.current = handleSubmitAnswer;
  }, [handleSubmitAnswer]);

  const handleNumberClick = (number: string) => {
    setCurrentAnswer(prev => prev + number);
  };

  const handleClear = () => {
    setCurrentAnswer('');
  };

  const handleBackspace = () => {
    setCurrentAnswer(prev => prev.slice(0, -1));
  };

  const handleAnimationComplete = () => {
    setAnimation(prev => ({ ...prev, isVisible: false }));
  };

  // Handle game completion separately - only trigger once when game is completed
  useEffect(() => {
    if (session?.isCompleted && session.endTime) {
      // Automatically transition to results after a short delay
      const timer = setTimeout(() => {
        onGameComplete(session);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [session?.isCompleted, session?.endTime]); // Remove onGameComplete from dependencies

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-4xl">Loading... 🎮</div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  const progress = (session.currentQuestionIndex / session.questions.length) * 100;
  const isLastQuestion = session.currentQuestionIndex >= session.questions.length;

  if (isLastQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <div className="text-8xl mb-4">🎉</div>
          <div className="text-4xl font-bold text-fun mb-2">Game Complete!</div>
          <div className="text-2xl text-gray-600">Calculating your score...</div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-between items-center mb-6"
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

          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg px-6 py-3">
                <Clock size={24} className="text-blue-500" />
                <span className="text-xl font-bold text-gray-800">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-4 border-white/60 rounded-3xl shadow-lg px-6 py-3">
              <Trophy size={24} className="text-yellow-500" />
              <span className="text-xl font-bold text-gray-800">
                {session.score}/{session.questions.length}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-bold text-gray-700">
              Question {session.currentQuestionIndex + 1} of {session.questions.length}
            </span>
            <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
              {streak > 0 ? `🔥 ${streak} streak!` : 'Keep going! 💪'}
            </Badge>
          </div>
          <Progress value={progress} className="h-4 progress-fun" />
        </motion.div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Card className="card-fun bg-gradient-to-br from-white to-blue-50 border-4 border-white/60 mb-6">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-5xl font-bold text-gray-800">
                {formatQuestion(currentQuestion)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center">
              <div className="text-8xl mb-6">🤔</div>
              
              {/* Answer Input */}
              <motion.div
                animate={{ scale: currentAnswer ? 1.05 : 1 }}
                className="mb-6"
              >
                <div className={`bg-white/80 border-4 rounded-3xl p-6 text-6xl font-bold text-center min-h-[120px] flex items-center justify-center transition-all duration-300 ${
                  feedbackColor || 'border-gray-300'
                }`}>
                  {currentAnswer || '?'}
                </div>
              </motion.div>
              
              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
                  <Button
                    key={number}
                    onClick={() => handleNumberClick(number.toString())}
                    className="btn-fun text-3xl py-6 aspect-square"
                  >
                    {number}
                  </Button>
                ))}
                
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-6 text-2xl border-4 border-red-200 rounded-3xl"
                >
                  Clear
                </Button>
                
                <Button
                  onClick={() => handleNumberClick('0')}
                  className="btn-fun text-3xl py-6"
                >
                  0
                </Button>
                
                <Button
                  onClick={handleBackspace}
                  variant="outline"
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold py-6 text-2xl border-4 border-yellow-200 rounded-3xl"
                >
                  ⌫
                </Button>
              </div>
              
              {/* Submit Button */}
              <Button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer}
                className="btn-fun text-3xl py-8 px-12 w-full max-w-md mx-auto flex items-center justify-center gap-4"
              >
                <Target size={32} />
                <span>Submit Answer!</span>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Animation Overlay */}
      <AnimatedFeedback
        animation={animation}
        onAnimationComplete={handleAnimationComplete}
      />
    </div>
  );
}
