import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_market') as any;
db.version(1).stores({ products: 'id' });

export interface MarketProduct {
  id: string;
  name: string;
  description: string;
  priceAltin: number;
  coinsAmount: number;
  spinAmount?: number;
  imageUrl?: string;
  icon?: string;
  category: string;
  active: boolean;
  hot?: boolean;
  limited?: boolean;
  color: string;
}

const DEFAULT_PRODUCTS: MarketProduct[] = [
  { id: 'mp1', name: 'Başlangıç Paketi', description: 'Yeni başlayanlar için 100 Coins', priceAltin: 300, coinsAmount: 100, icon: '🪙', category: 'paket', active: true, color: '#5cff7f' },
  { id: 'mp2', name: 'Orta Paket', description: '250 Coins - En çok tercih edilen!', priceAltin: 700, coinsAmount: 250, icon: '💎', category: 'paket', active: true, hot: true, color: '#40a9ff' },
  { id: 'mp3', name: 'Büyük Paket', description: '600 Coins - Büyük avantaj!', priceAltin: 1500, coinsAmount: 600, icon: '🔥', category: 'paket', active: true, color: '#ff6b35' },
  { id: 'mp4', name: 'Dev Paket', description: '1500 Coins - Maksimum değer!', priceAltin: 3500, coinsAmount: 1500, icon: '👑', category: 'paket', active: true, limited: true, color: '#FFD700' },
  { id: 'mp5', name: 'Mini Paket', description: '50 Coins - Denemek için mükemmel', priceAltin: 160, coinsAmount: 50, icon: '⚡', category: 'paket', active: true, color: '#9147ff' },
  { id: 'mp6', name: 'Hız Paketi', description: '400 Coins + bonus avantaj', priceAltin: 950, coinsAmount: 400, icon: '🚀', category: 'paket', active: true, hot: true, color: '#ff4444' },
  { id: 'mp7', name: 'Ateş Emote Paketi', description: '5 adet özel ateş animasyonlu emote', priceAltin: 150, coinsAmount: 0, icon: '🔥', category: 'emote', active: true, hot: true, color: '#ff6b35' },
  { id: 'mp8', name: 'Şimşek Emote Paketi', description: '5 adet şimşek temalı emote', priceAltin: 120, coinsAmount: 0, icon: '⚡', category: 'emote', active: true, color: '#FFD700' },
  { id: 'mp9', name: 'Altın Çerçeve', description: 'Profil avatarı için altın çerçeve', priceAltin: 300, coinsAmount: 0, icon: '👑', category: 'avatar', active: true, limited: true, color: '#FFD700' },
  { id: 'mp10', name: 'Şampiyon Rozeti', description: 'Sohbette özel şampiyon rozeti', priceAltin: 500, coinsAmount: 0, icon: '🏆', category: 'rozet', active: true, limited: true, color: '#FFD700' },
  { id: 'mp11', name: 'Pro Oyuncu Rozeti', description: 'Pro oyuncu unvanı rozeti', priceAltin: 350, coinsAmount: 0, icon: '🎯', category: 'rozet', active: true, hot: true, color: '#ff4444' },
  { id: 'mp12', name: 'Gökkuşağı Chat', description: 'Sohbet yazıları renkli görünür', priceAltin: 400, coinsAmount: 0, icon: '🌈', category: 'efekt', active: true, limited: true, color: '#ff6b9d' },
  { id: 'mp13', name: 'VIP Üyelik 7 Gün', description: '7 günlük VIP ayrıcalıkları', priceAltin: 800, coinsAmount: 0, icon: '💎', category: 'ozel', active: true, limited: true, color: '#00b3ff' },
  { id: 'mp14', name: 'Ekstra Spin Hakkı', description: 'Şans çarkı için +1 hak', priceAltin: 80, coinsAmount: 0, spinAmount: 1, icon: '🎡', category: 'ozel', active: true, hot: true, color: '#9147ff' },
];

interface MarketContextValue {
  products: MarketProduct[];
  addProduct: (p: Omit<MarketProduct, 'id'>) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, changes: Partial<MarketProduct>) => void;
  toggleProduct: (id: string) => void;
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<MarketProduct[]>(DEFAULT_PRODUCTS);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await db.products.toArray();
      if (data && data.length > 0) setProducts(data);
      else await db.products.bulkPut(DEFAULT_PRODUCTS);
    } catch { /* ignore */ }
  };

  const save = async (p: MarketProduct[]) => {
    await db.products.clear();
    await db.products.bulkPut(p);
  };

  const addProduct = useCallback((p: Omit<MarketProduct, 'id'>) => {
    setProducts((prev) => { const next = [...prev, { ...p, id: Date.now().toString() }]; save(next); return next; });
  }, []);
  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => { const next = prev.filter((p) => p.id !== id); save(next); return next; });
  }, []);
  const updateProduct = useCallback((id: string, changes: Partial<MarketProduct>) => {
    setProducts((prev) => { const next = prev.map((p) => p.id === id ? { ...p, ...changes } : p); save(next); return next; });
  }, []);
  const toggleProduct = useCallback((id: string) => {
    setProducts((prev) => { const next = prev.map((p) => p.id === id ? { ...p, active: !p.active } : p); save(next); return next; });
  }, []);

  return (
    <MarketContext.Provider value={{ products, addProduct, removeProduct, updateProduct, toggleProduct }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be inside MarketProvider');
  return ctx;
}

export default MarketContext;
