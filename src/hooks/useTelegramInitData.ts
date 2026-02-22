declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        initDataUnsafe: Record<string, unknown>;
        initData: string;
      };
    };
  }
}

export function useTelegramInitData() {
  const initData = window.Telegram?.WebApp?.initData || "";
  const initDataUnsafe = window.Telegram?.WebApp?.initDataUnsafe || {};

  return { initData, initDataUnsafe };
}
