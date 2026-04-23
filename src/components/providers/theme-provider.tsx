"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  themeColor: string;
  setThemeColor: (val: string) => void;
  fontSize: number;
  setFontSize: (val: number) => void;
  persistTheme: (settings: { darkMode: boolean; themeColor: string; fontSize: number }) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [themeColor, setThemeColor] = useState("zyra");
  const [fontSize, setFontSize] = useState(14);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount only
  useEffect(() => {
    const saved = localStorage.getItem('zyra-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
        if (parsed.themeColor) setThemeColor(parsed.themeColor);
        if (parsed.fontSize) {
          // Fix for possible array format from previous implementations
          const size = Array.isArray(parsed.fontSize) ? parsed.fontSize[0] : parsed.fontSize;
          setFontSize(size);
        }
      } catch (e) {
        console.error("Error loading theme settings", e);
      }
    }
    setMounted(true);
  }, []);

  // Apply theme classes and variables globally
  useEffect(() => {
    if (!mounted) return;

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    document.documentElement.setAttribute('data-theme', themeColor);
    // Apply font size to HTML to scale REM units globally
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
  }, [darkMode, themeColor, fontSize, mounted]);

  const persistTheme = (settings: { darkMode: boolean; themeColor: string; fontSize: number }) => {
    localStorage.setItem('zyra-settings', JSON.stringify({ 
      darkMode: settings.darkMode, 
      themeColor: settings.themeColor, 
      fontSize: settings.fontSize 
    }));
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, themeColor, setThemeColor, fontSize, setFontSize, persistTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}