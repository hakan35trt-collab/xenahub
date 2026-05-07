import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_wallet') as any;
db.version(1).stores({ wallets: 'userId' });

export interface Wallet {
  userId: string;
  balance: number;
  coinsBalance: number;
  transactions: { id: string; amount: number; type: string; note: string; timestamp: number }[];
}

interface WalletContextValue {
  wallets: Record<string, Wallet>;
  getWallet: (userId: string) => Wallet;
  addCoins: (userId: string, amount: number, note?: string) => void;
  purchaseCoins: (userId: string, altinCost: number, coinsAmount: number, productName: string) => { success: boolean; error?: string };
  getLeaderboard: () => { userId: string; username: string; balance: number }[];
}

const DEFAULT_WALLET = (userId: string): Wallet => ({
  userId, balance: 0, coinsBalance: 0, transactions: [],
});

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Record<string, Wallet>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await db.wallets.toArray();
      const map: Record<string, Wallet> = {};
      for (const w of data) map[w.userId] = w;
      setWallets(map);
    } catch { /* ignore */ }
  };

  const saveWallets = async (w: Record<string, Wallet>) => {
    await db.wallets.clear();
    await db.wallets.bulkPut(Object.values(w));
  };

  const getWallet = useCallback((userId: string) => {
    return wallets[userId] || DEFAULT_WALLET(userId);
  }, [wallets]);

  const addCoins = useCallback((userId: string, amount: number, note?: string) => {
    setWallets((prev) => {
      const current = prev[userId] || DEFAULT_WALLET(userId);
      const tx = { id: Date.now().toString(), amount, type: amount >= 0 ? 'earn' : 'spend', note: note || '', timestamp: Date.now() };
      const next = { ...prev, [userId]: { ...current, balance: Math.max(0, current.balance + amount), transactions: [...current.transactions, tx] } };
      saveWallets(next);
      return next;
    });
  }, []);

  const purchaseCoins = useCallback((userId: string, altinCost: number, coinsAmount: number, productName: string): { success: boolean; error?: string } => {
    const wallet = getWallet(userId);
    if (wallet.balance < altinCost) return { success: false, error: 'Yetersiz Altın' };
    setWallets((prev) => {
      const current = prev[userId] || DEFAULT_WALLET(userId);
      const tx1 = { id: Date.now().toString(), amount: -altinCost, type: 'spend', note: `Coins Paketi: ${productName}`, timestamp: Date.now() };
      const tx2 = { id: (Date.now() + 1).toString(), amount: coinsAmount, type: 'coins', note: `Coins alındı: ${productName}`, timestamp: Date.now() };
      const next = { ...prev, [userId]: { ...current, balance: current.balance - altinCost, coinsBalance: current.coinsBalance + coinsAmount, transactions: [...current.transactions, tx1, tx2] } };
      saveWallets(next);
      return next;
    });
    return { success: true };
  }, [getWallet]);

  const getLeaderboard = useCallback(() => {
    return Object.values(wallets)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 20)
      .map((w) => ({ userId: w.userId, username: w.userId.substring(0, 8), balance: w.balance }));
  }, [wallets]);

  return (
    <WalletContext.Provider value={{ wallets, getWallet, addCoins, purchaseCoins, getLeaderboard }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be inside WalletProvider');
  return ctx;
}

export default WalletContext;
