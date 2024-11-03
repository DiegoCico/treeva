// ThemeContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Load initial theme from localStorage or default to light mode
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : false;
  });

  // Apply the theme to the document body and save it to localStorage
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Sync theme across tabs
  useEffect(() => {
    const syncThemeAcrossTabs = (e) => {
      if (e.key === 'theme') {
        setIsDarkMode(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', syncThemeAcrossTabs);
    return () => window.removeEventListener('storage', syncThemeAcrossTabs);
  }, []);

  const toggleTheme = () => setIsDarkMode(prevMode => !prevMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
