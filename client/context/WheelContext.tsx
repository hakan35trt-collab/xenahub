import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_wheel') as any;
db.version(1).stores({
  spins: 'userId',
  config: 'key',
  history: 'id',
});

const REWARDS = [
  { label: '25 Altın', value: 25, type: 'gold', color: '#FFD700', weight: 20 },
  { label: '50 Altın', value: 50, type: 'gold', color: '#FFD700', weight: 18 },
  { label: '100 Altın', value: 100, type: 'gold', color: '#FFD700', weight: 15 },
  { label: '250 Altın', value: 250, type: 'gold', color: '#FFD700', weight: 10 },
  { label: '500 Altın', value: 500, type: 'gold', color: '#FFD700', weight: 5 },
  { label: '1000 Altın', value: 1000, type: 'gold', color: '#FFD700', weight: 2 },
  { label: 'Şans Çarkı', value: 1, type: 'spin', color: '#9147ff', weight: 8 },
  { label: 'Boş', value: 0, type: 'none', color: '#6b6b8a', weight: 22 },
];

export interface WheelConfig {
  cooldownMs: number;
  segments: typeof REWARDS;
  onlineRange: { min: number; max: number };
}

export interface SpinState {
  userId: string;
  lastSpinAt: number;
  remainingSpins: number;
  totalSpins: number;
  totalWon: number;
}

export interface SpinHistory {
  id: string;
  userId: string;
  username: string;
  reward: string;
  value: number;
  timestamp: number;
}

interface WheelContextValue {
  config: WheelConfig;
  canSpin: (userId: string) => boolean;
  getSpinState: (userId: string) => SpinState;
  spin: (userId: string, username: string) => { reward: typeof REWARDS[0]; remainingSpins: number };
  getHistory: () => SpinHistory[];
  grantSpin: (userId: string) => void;
}

const DEFAULT_CONFIG: WheelConfig = {
  cooldownMs: 6 * 60 * 60 * 1000,
  segments: REWARDS,
  onlineRange: { min: 1200, max: 3500 },
};

const DEFAULT_STATE = (userId: string): SpinState => ({
  userId, lastSpinAt: 0, remainingSpins: 1, totalSpins: 0, totalWon: 0,
});

const WheelContext = createContext<WheelContextValue | null>(null);

function weightedRandom(items: typeof REWARDS) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export function WheelProvider({ children }: { children: React.ReactNode }) {
  const [config] = useState<WheelConfig>(DEFAULT_CONFIG);
  const [spinStates, setSpinStates] = useState<Record<string, SpinState>>({});
  const [history, setHistory] = useState<SpinHistory[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const states = await db.spins.toArray();
      const map: Record<string, SpinState> = {};
      for (const s of states) map[s.userId] = s;
      setSpinStates(map);
      const hist = await db.history.orderBy('timestamp').reverse().limit(50).toArray();
      setHistory(hist);
    } catch { /* ignore */ }
  };

  const saveStates = async (s: Record<string, SpinState>) => {
    await db.spins.clear();
    await db.spins.bulkPut(Object.values(s));
  };
  const saveHistory = async (h: SpinHistory[]) => {
    await db.history.clear();
    await db.history.bulkPut(h.slice(0, 100));
  };

  const getSpinState = useCallback((userId: string) => {
    const s = spinStates[userId] || DEFAULT_STATE(userId);
    const now = Date.now();
    if (s.lastSpinAt > 0 && now - s.lastSpinAt >= config.cooldownMs && s.remainingSpins < 1) {
      const refreshed = { ...s, remainingSpins: 1 };
      setSpinStates((prev) => { const next = { ...prev, [userId]: refreshed }; saveStates(next); return next; });
      return refreshed;
    }
    return s;
  }, [spinStates, config.cooldownMs]);

  const canSpin = useCallback((userId: string) => {
    const s = getSpinState(userId);
    return s.remainingSpins > 0;
  }, [getSpinState]);

  const spin = useCallback((userId: string, username: string) => {
    const state = getSpinState(userId);
    if (state.remainingSpins <= 0) return { reward: REWARDS[7], remainingSpins: 0 };
    const reward = weightedRandom(config.segments);
    const nextState: SpinState = {
      ...state,
      lastSpinAt: Date.now(),
      remainingSpins: state.remainingSpins - 1,
      totalSpins: state.totalSpins + 1,
      totalWon: state.totalWon + (reward.type === 'gold' ? reward.value : 0),
    };
    setSpinStates((prev) => { const next = { ...prev, [userId]: nextState }; saveStates(next); return next; });
    const entry: SpinHistory = { id: Date.now().toString(), userId, username, reward: reward.label, value: reward.value, timestamp: Date.now() };
    setHistory((prev) => { const next = [entry, ...prev].slice(0, 100); saveHistory(next); return next; });
    return { reward, remainingSpins: nextState.remainingSpins };
  }, [getSpinState, config.segments]);

  const grantSpin = useCallback((userId: string) => {
    const state = getSpinState(userId);
    const nextState = { ...state, remainingSpins: state.remainingSpins + 1 };
    setSpinStates((prev) => { const next = { ...prev, [userId]: nextState }; saveStates(next); return next; });
  }, [getSpinState]);

  const getHistory = useCallback(() => history, [history]);

  return (
    <WheelContext.Provider value={{ config, canSpin, getSpinState, spin, getHistory, grantSpin }}>
      {children}
    </WheelContext.Provider>
  );
}

export function useWheel() {
  const ctx = useContext(WheelContext);
  if (!ctx) throw new Error('useWheel must be inside WheelProvider');
  return ctx;
}

export default WheelContext;
