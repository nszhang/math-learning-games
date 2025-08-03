"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from 'next/navigation';
import Dashboard from "@/components/Dashboard";
import DifficultySelector from "@/components/DifficultySelector";
import GameScreen from "@/components/GameScreen";
import GameResults from "@/components/GameResults";
import { GameType, GameConfig, GameSession } from "@/types";
import { calculateScore, checkForNewBadges } from "@/lib/gameUtils";
import { GameStatsService } from "@/lib/database";

import RobustAuthWrapper from '@/components/RobustAuthWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import DebugConsole from '@/components/DebugConsole';
import LoadingMonitor from '@/components/LoadingMonitor';

export default function Home() {
  const renderStartTime = performance.now();
  console.log('🏠 Home component: Starting render at', new Date().toISOString());
  console.log('🕰️ Home component: Render start time:', renderStartTime);
  
  const searchParams = useSearchParams();
  const fromAuth = searchParams.get('fromAuth') === 'true';
  
  console.log('🔍 Home component: fromAuth =', fromAuth);
  console.log('🔍 Home component: searchParams =', Object.fromEntries(searchParams.entries()));
  
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "difficulty" | "game" | "results">(
    "dashboard",
  );
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  
  console.log('📱 Home component: currentScreen =', currentScreen);
  
  // Clean up the URL after detecting the fromAuth parameter
  useEffect(() => {
    console.log('🔄 Home component: useEffect triggered for URL cleanup');
    if (fromAuth) {
      console.log('🧹 Home component: Cleaning up auth parameters from URL');
      // Remove both fromAuth and delay parameters from the URL
      const url = new URL(window.location.href);
      url.searchParams.delete('fromAuth');
      url.searchParams.delete('delay');
      window.history.replaceState({}, '', url.toString());
      console.log('✅ Home component: URL cleanup complete');
    }
  }, [fromAuth]);
  
  // Log render completion
  useEffect(() => {
    const renderEndTime = performance.now();
    console.log('🏠 Home component: Render completed at', new Date().toISOString());
    console.log('🕰️ Home component: Render duration:', (renderEndTime - renderStartTime).toFixed(2), 'ms');
  });

  function handleGameSelect(gameType: GameType) {
    console.log('🎮 Home component: Game selected:', gameType);
    setSelectedGameType(gameType);
    setCurrentScreen("difficulty");
    console.log('📱 Home component: Screen changed to difficulty');
  }

  function handleDifficultySelect(difficulty: "easy" | "medium" | "hard") {
    if (!selectedGameType) return;
    const config: GameConfig = {
      type: selectedGameType,
      difficulty,
      timeLimit: difficulty === "easy" ? 60 : difficulty === "medium" ? 45 : 30,
      questionCount: 10,
    };
    setGameConfig(config);
    setCurrentScreen("game");
  }

  async function handleGameComplete(session: GameSession) {
    try {
      // Save the game session to the database
      await GameStatsService.saveGameSession(session);
      
      // Check for new badges
      const score = calculateScore(session.questions);
      const newBadges = checkForNewBadges(score, session.config.type, []);
      
      // Save any new badges
      if (newBadges.length > 0) {
        await GameStatsService.saveBadges(newBadges);
      }
      
      setGameSession(session);
      setCurrentScreen("results");
    } catch (error) {
      console.error('Failed to save game session:', error);
      // Still show results even if saving failed
      setGameSession(session);
      setCurrentScreen("results");
    }
  }

  function handleBackToDashboard() {
    setCurrentScreen("dashboard");
    setSelectedGameType(null);
    setGameConfig(null);
    setGameSession(null);
  }

  function handlePlayAgain() {
    if (gameConfig) {
      setCurrentScreen("game");
    } else {
      setCurrentScreen("difficulty");
    }
  }

  console.log('🔄 Home component: About to render, currentScreen =', currentScreen);
  
  if (currentScreen === "difficulty" && selectedGameType) {
    console.log('📱 Home component: Rendering DifficultySelector for', selectedGameType);
    return (
      <DifficultySelector
        gameType={selectedGameType}
        onDifficultySelect={handleDifficultySelect}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentScreen === "game" && gameConfig) {
    console.log('🎮 Home component: Rendering GameScreen with config:', gameConfig);
    return <GameScreen config={gameConfig} onGameComplete={handleGameComplete} onBack={handleBackToDashboard} />;
  }

  if (currentScreen === "results" && gameSession) {
    console.log('🏆 Home component: Rendering GameResults');
    const score = calculateScore(gameSession.questions);
    const newBadges = checkForNewBadges(score, gameSession.config.type, []);
    
    return (
      <GameResults
        session={gameSession}
        newBadges={newBadges}
        onPlayAgain={handlePlayAgain}
        onBackToHome={handleBackToDashboard}
      />
    );
  }

  console.log('🏠 Home component: Rendering Dashboard with MinimalAuthWrapper');
  console.log('🔐 Home component: expectAuthenticated =', fromAuth);
  
  return (
    <ErrorBoundary>
      <RobustAuthWrapper 
        expectAuthenticated={fromAuth}
      >
        <Dashboard onGameSelect={handleGameSelect} />
      </RobustAuthWrapper>
      <DebugConsole />
      <LoadingMonitor />
    </ErrorBoundary>
  );
}
