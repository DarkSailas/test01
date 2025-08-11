"use client";

import { useState, useEffect, useCallback } from 'react';

export type Language = 'ru' | 'en';

export interface Settings {
  scale: number;
  opacity: number;
  language: Language;
}

export type SetSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => void;

const SETTINGS_KEY = 'night-reign-timer-settings';

export const defaultSettings: Settings = {
  scale: 1.0,
  opacity: 0.8,
  language: 'en',
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Validate parsed settings
        const newSettings = { ...defaultSettings };
        if (typeof parsed.scale === 'number') newSettings.scale = parsed.scale;
        if (typeof parsed.opacity === 'number') newSettings.opacity = parsed.opacity;
        if (parsed.language === 'ru' || parsed.language === 'en') newSettings.language = parsed.language;
        setSettings(newSettings);
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      setSettings(defaultSettings);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }
  }, [settings, isLoaded]);

  const setSetting: SetSetting = useCallback((key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(prev => {
        const newSettings = {
            ...defaultSettings,
            language: prev.language, // Keep the current language
        };
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
        return newSettings;
    });
  }, []);

  return { settings, setSetting, resetSettings, isLoaded };
}
