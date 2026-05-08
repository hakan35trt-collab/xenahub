import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_wheel') as any;
db.version(1).stores({
  spins: 'userId',
  config: 'key',
  history: 'id',
});

const get = <T,>(key: string, fallback: T): T => { 
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } 
  catch { return fallback; } 
};
const set = <T,>(key: string, data: T) => { 
  try { localStorage.setItem(key, JSON.stringify(data)); } 
  catch { /* ignore */ } 
};

export interface WheelReward {
  id: string;
  label: string;
  value: number;
  type: 'gold' | 'spin' | 'none';
  color: string;
  weight: number;
}

export interface WheelConfig {
  cooldownMs: number;
  rewards: WheelReward[];
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
  spin: (userId: string, username: string) => { reward: WheelReward; remainingSpins: number };
  getHistory: () => SpinHistory[];
  grantSpin: (userId: string) => void;
  // Admin functions
  rewards: WheelReward[];
  addReward: (reward: Omit<WheelReward, 'id'>) => void;
  removeReward: (id: string) => void;
  updateReward: (id: string, updates: Partial<WheelReward>) => void;
  setCooldown: (ms: number) => void;
}

const DEFAULT_REWARDS: WheelReward[] = [
  { id: 'r1', label: '25 Altın', value: 25, type: 'gold', color: '#FFD700', weight: 20 },
  { id: 'r2', label: '50 Altın', value: 50, type: 'gold', color: '#FFA500', weight: 18 },
  { id: 'r3', label: '100 Altın', value: 100, type: 'gold', color: '#FF8C00', weight: 15 },
  { id: 'r4', label: '250 Altın', value: 250, type: 'gold', color: '#FF6347', weight: 10 },
  { id: 'r5', label: '500 Altın', value: 500, type: 'gold', color: '#FF4500', weight: 5 },
  { id: 'r6', label: '1000 Altın', value: 1000, type: 'gold', color: '#DC143C', weight: 2 },
  { id: 'r7', label: 'Ekstra Çark', value: 1, type: 'spin', color: '#9147ff', weight: 8 },
  { id: 'r8', label: 'Boş', value: 0, type: 'none', color: '#4a4a6a', weight: 22 },
];

const DEFAULT_CONFIG: WheelConfig = {
  cooldownMs: 6 * 60 * 60 * 1000, // 6 saat
  rewards: DEFAULT_REWARDS,
};

const DEFAULT_STATE = (userId: string): SpinState => ({
  userId, lastSpinAt: 0, remainingSpins: 1, totalSpins: 0, totalWon: 0,
});

const WheelContext = createContext<WheelContextValue | null>(null);

function weightedRandom(items: WheelReward[]): WheelReward {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1];
}

export function WheelProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<WheelConfig>(() => 
    get('xenahub_wheel_config', DEFAULT_CONFIG)
  );
  const [spinStates, setSpinStates] = useState<Record<string, SpinState>>({});
  const [history, setHistory] = useState<SpinHistory[]>([]);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    set('xenahub_wheel_config', config);
  }, [config]);

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

  // Admin functions
  const addReward = useCallback((reward: Omit<WheelReward, 'id'>) => {
    const newReward: WheelReward = { ...reward, id: Date.now().toString() };
    setConfig(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward]
    }));
  }, []);

  const removeReward = useCallback((id: string) => {
    setConfig(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== id)
    }));
  }, []);

  const updateReward = useCallback((id: string, updates: Partial<WheelReward>) => {
    setConfig(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  }, []);

  const setCooldown = useCallback((ms: number) => {
    setConfig(prev => ({ ...prev, cooldownMs: ms }));
  }, []);

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
    if (state.remainingSpins <= 0) return { reward: config.rewards.find(r => r.type === 'none') || config.rewards[0], remainingSpins: 0 };
    const reward = weightedRandom(config.rewards);
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
  }, [getSpinState, config.rewards]);

  const grantSpin = useCallback((userId: string) => {
    const state = getSpinState(userId);
    const nextState = { ...state, remainingSpins: state.remainingSpins + 1 };
    setSpinStates((prev) => { const next = { ...prev, [userId]: nextState }; saveStates(next); return next; });
  }, [getSpinState]);

  const getHistory = useCallback(() => history, [history]);

  return (
    <WheelContext.Provider value={{ 
      config, canSpin, getSpinState, spin, getHistory, grantSpin,
      rewards: config.rewards,
      addReward, removeReward, updateReward, setCooldown
    }}>
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
