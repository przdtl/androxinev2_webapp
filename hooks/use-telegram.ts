'use client';

import { useEffect, useState, useCallback } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    start_param?: string;
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

export interface UseTelegramReturn {
  webApp: TelegramWebApp | null;
  user: TelegramWebApp['initDataUnsafe']['user'] | null;
  initData: string | null;
  colorScheme: 'light' | 'dark';
  isReady: boolean;
  haptic: TelegramWebApp['HapticFeedback'] | null;
  showBackButton: (callback: () => void) => void;
  hideBackButton: () => void;
}

export function useTelegram(): UseTelegramReturn {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [backCallback, setBackCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const initTelegram = () => {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        setWebApp(tg);
        tg.ready();
        tg.expand();
        setIsReady(true);

        // Apply theme
        if (tg.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Development mode - simulate Telegram WebApp
        setIsReady(true);
      }
    };

    // Check if already loaded
    if (window.Telegram?.WebApp) {
      initTelegram();
      return;
    }

    // Dynamically load the Telegram WebApp script
    const existingScript = document.querySelector('script[src*="telegram-web-app"]');
    if (existingScript) {
      existingScript.addEventListener('load', initTelegram);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = initTelegram;
    script.onerror = () => {
      // Development mode fallback
      setIsReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // Handle back button
  useEffect(() => {
    if (!webApp) return;
    
    if (backCallback) {
      webApp.BackButton.onClick(backCallback);
      return () => {
        webApp.BackButton.offClick(backCallback);
      };
    }
  }, [webApp, backCallback]);

  const showBackButton = useCallback((callback: () => void) => {
    setBackCallback(() => callback);
    webApp?.BackButton.show();
  }, [webApp]);

  const hideBackButton = useCallback(() => {
    setBackCallback(null);
    webApp?.BackButton.hide();
  }, [webApp]);

  return {
    webApp,
    user: webApp?.initDataUnsafe.user || null,
    initData: webApp?.initData || null,
    colorScheme: webApp?.colorScheme || 'light',
    isReady,
    haptic: webApp?.HapticFeedback || null,
    showBackButton,
    hideBackButton,
  };
}
