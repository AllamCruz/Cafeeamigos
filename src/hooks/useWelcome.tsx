import { useState } from 'react';

export const useWelcome = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  const dismissWelcome = () => {
    setShowWelcome(false);
  };

  const resetWelcome = () => {
    setShowWelcome(true);
  };

  return {
    showWelcome,
    dismissWelcome,
    resetWelcome
  };
};