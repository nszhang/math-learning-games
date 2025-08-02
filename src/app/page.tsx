"use client";

import { useState, useRef } from "react";
import Dashboard from "@/components/Dashboard";
import DifficultySelector from "@/components/DifficultySelector";
import GameScreen from "@/components/GameScreen";
import GameResults from "@/components/GameResults";
import { GameType, GameConfig, GameSession } from "@/types";
import { calculateScore, checkForNewBadges } from "@/lib/gameUtils";
import { GameStatsService } from "@/lib/database";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"dashboard" | "difficulty" | "game" | "results">(
    "dashboard",
  );
  const [selectedGameType, setSelectedGameType] = useState<GameType | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  function handleGameSelect(gameType: GameType) {
    setSelectedGameType(gameType);
    setCurrentScreen("difficulty");
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

  if (currentScreen === "difficulty" && selectedGameType) {
    return (
      <DifficultySelector
        gameType={selectedGameType}
        onDifficultySelect={handleDifficultySelect}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentScreen === "game" && gameConfig) {
    return <GameScreen config={gameConfig} onGameComplete={handleGameComplete} onBack={handleBackToDashboard} />;
  }

  if (currentScreen === "results" && gameSession) {
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

  return <Dashboard onGameSelect={handleGameSelect} />;
}
