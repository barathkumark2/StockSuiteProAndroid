// ─────────────────────────────────────────────────────────────
// SettingsContext.tsx  –  Global app settings (persistent)
// ─────────────────────────────────────────────────────────────
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  DEFAULT_GLOBAL_SETTINGS,
  getItem,
  GlobalSettings,
  setItem,
  STORAGE_KEYS,
} from '../db/storage';
import type { ThemeKey } from '../theme/theme';
import { THEMES } from '../theme/theme';

interface SettingsContextType extends GlobalSettings {
  palette: (typeof THEMES)[ThemeKey];
  setCurrency: (v: string) => Promise<void>;
  setTheme: (v: ThemeKey) => Promise<void>;
  setDecimals: (v: number) => Promise<void>;
  isReady: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<GlobalSettings>(
    DEFAULT_GLOBAL_SETTINGS
  );
  const [isReady, setIsReady] = useState(false);

  // Load on mount
  useEffect(() => {
    (async () => {
      const saved = await getItem<GlobalSettings>(
        STORAGE_KEYS.GLOBAL_SETTINGS,
        DEFAULT_GLOBAL_SETTINGS
      );
      setSettings(saved);
      setIsReady(true);
    })();
  }, []);

  const save = useCallback(
    async (patch: Partial<GlobalSettings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      await setItem(STORAGE_KEYS.GLOBAL_SETTINGS, next);
    },
    [settings]
  );

  const setCurrency = useCallback(
    (currency: string) => save({ currency }),
    [save]
  );

  const setTheme = useCallback(
    (theme: ThemeKey) => save({ theme }),
    [save]
  );

  const setDecimals = useCallback(
    (decimals: number) => save({ decimals }),
    [save]
  );

  const palette = THEMES[(settings.theme as ThemeKey) ?? 'dark'];

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        palette,
        setCurrency,
        setTheme,
        setDecimals,
        isReady,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings(): SettingsContextType {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
