import { useState, useEffect } from 'react';

const WELCOME_STORAGE_KEY = 'cafe-amigos-welcome-seen';

export const useWelcome = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_STORAGE_KEY);
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  const dismissWelcome = () => {
    localStorage.setItem(WELCOME_STORAGE_KEY, 'true');
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    localStorage.removeItem(WELCOME_STORAGE_KEY);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    dismissWelcome,
    resetWelcome
  };
};