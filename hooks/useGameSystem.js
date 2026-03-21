// hooks/useGameSystem.js — XP, Level, Streak management
import { useState, useEffect, useCallback } from 'react';

const GAME_KEY = 'ss_game_data';

function getToday() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function loadGameData() {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { xp: 0, streak: 0, lastActiveDate: null, questionsAnswered: 0, quizzesCompleted: 0, dailyLoginDone: false };
}

function saveGameData(data) {
  localStorage.setItem(GAME_KEY, JSON.stringify(data));
}

export function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

export function getXpForNextLevel(xp) {
  const level = getLevel(xp);
  return level * 100;
}

export function getXpProgress(xp) {
  const currentLevelStart = (getLevel(xp) - 1) * 100;
  const nextLevelXp = getLevel(xp) * 100;
  return ((xp - currentLevelStart) / (nextLevelXp - currentLevelStart)) * 100;
}

export function useGameSystem() {
  const [gameData, setGameData] = useState(loadGameData);

  // Check and update streak + daily login on mount
  useEffect(() => {
    const data = loadGameData();
    const today = getToday();
    const yesterday = getYesterday();
    let changed = false;

    // Streak logic
    if (data.lastActiveDate === today) {
      // Already active today, no change
    } else if (data.lastActiveDate === yesterday) {
      // Consecutive day — increment streak
      data.streak += 1;
      data.lastActiveDate = today;
      data.dailyLoginDone = false;
      changed = true;
    } else if (data.lastActiveDate) {
      // Missed day — reset streak
      data.streak = 1;
      data.lastActiveDate = today;
      data.dailyLoginDone = false;
      changed = true;
    } else {
      // First ever login
      data.streak = 1;
      data.lastActiveDate = today;
      data.dailyLoginDone = false;
      changed = true;
    }

    // Daily login XP (once per day)
    if (!data.dailyLoginDone) {
      data.xp += 10;
      data.dailyLoginDone = true;
      changed = true;
    }

    if (changed) {
      saveGameData(data);
      setGameData({ ...data });
    }
  }, []);

  const addXp = useCallback((amount) => {
    setGameData(prev => {
      const updated = { ...prev, xp: prev.xp + amount, lastActiveDate: getToday() };
      saveGameData(updated);
      return updated;
    });
  }, []);

  const recordQuestion = useCallback(() => {
    setGameData(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + 5,
        questionsAnswered: prev.questionsAnswered + 1,
        lastActiveDate: getToday(),
      };
      saveGameData(updated);
      return updated;
    });
  }, []);

  const recordQuizComplete = useCallback(() => {
    setGameData(prev => {
      const updated = {
        ...prev,
        xp: prev.xp + 20,
        quizzesCompleted: prev.quizzesCompleted + 1,
        lastActiveDate: getToday(),
      };
      saveGameData(updated);
      return updated;
    });
  }, []);

  return {
    xp: gameData.xp,
    level: getLevel(gameData.xp),
    xpProgress: getXpProgress(gameData.xp),
    xpForNextLevel: getXpForNextLevel(gameData.xp),
    streak: gameData.streak,
    questionsAnswered: gameData.questionsAnswered,
    quizzesCompleted: gameData.quizzesCompleted,
    addXp,
    recordQuestion,
    recordQuizComplete,
  };
}
