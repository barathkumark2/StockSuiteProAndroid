// ─────────────────────────────────────────────────────────────
// storage.ts  –  AsyncStorage helpers + typed store
// ─────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Data shapes (mirror web db.ts) ──────────────────────────

export interface Tranche {
  id: string;
  buyPrice: number;
  quantity: number;
}

export interface ProfitLossData {
  buyPrice: number;
  sellPrice: number;
  quantity: number;
  brokerageFeePerShare: number;
  useBrokerage: boolean;
}

export interface TargetAvgData {
  currentAvg: number;
  currentShares: number;
  targetAvg: number;
  cmp: number;
}

export interface LossRecoveryData {
  originalValue: number;
  currentValue: number;
}

export interface GlobalSettings {
  currency: string;
  theme: string;
  decimals: number;
}

export interface PortfolioPosition {
  id: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  cmp: number;
}

// ─── Storage keys ─────────────────────────────────────────────
export const STORAGE_KEYS = {
  TRANCHES: '@ssp/tranches',
  PROFIT_LOSS: '@ssp/profitLoss',
  TARGET_AVG: '@ssp/targetAvg',
  LOSS_RECOVERY: '@ssp/lossRecovery',
  GLOBAL_SETTINGS: '@ssp/globalSettings',
  PORTFOLIO: '@ssp/portfolio',
} as const;

// ─── Generic helpers ─────────────────────────────────────────

export async function getItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silent – storage failure should not crash the app
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // silent
  }
}

// ─── Default values ──────────────────────────────────────────

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  currency: '₹',
  theme: 'dark',
  decimals: 2,
};

export const DEFAULT_PROFIT_LOSS: ProfitLossData = {
  buyPrice: 0,
  sellPrice: 0,
  quantity: 0,
  brokerageFeePerShare: 0,
  useBrokerage: false,
};

export const DEFAULT_TARGET_AVG: TargetAvgData = {
  currentAvg: 0,
  currentShares: 0,
  targetAvg: 0,
  cmp: 0,
};

export const DEFAULT_LOSS_RECOVERY: LossRecoveryData = {
  originalValue: 0,
  currentValue: 0,
};
