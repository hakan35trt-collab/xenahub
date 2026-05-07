import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/* ===== Storage Helpers ===== */
const get = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};
const set = <T,>(key: string, data: T) => localStorage.setItem(key, JSON.stringify(data));

const KEYS = {
  ticker: 'xenahub_admin_ticker',
  news: 'xenahub_admin_news',
  events: 'xenahub_admin_events',
  market: 'xenahub_admin_market',
  pwa: 'xenahub_admin_pwa',
};

/* ===== Types ===== */
export interface TickerItem { id: string; text: string; active: boolean; }
export interface NewsItem { id: string; title: string; summary: string; content: string; date: string; category: string; active: boolean; readTime?: string; likes?: number; isNew?: boolean; }
export interface EventItem { id: string; title: string; description: string; date: string; time: string; location: string; type: string; prize?: string; participants: number; maxParticipants?: number; active: boolean; }
export interface MarketItem { id: string; name: string; description: string; price: number; category: string; active: boolean; hot?: boolean; limited?: boolean; color: string; }
export interface PWASettings { name: string; shortName: string; themeColor: string; backgroundColor: string; }

/* ===== Defaults ===== */
const defaultTicker: TickerItem[] = [
  { id: 't1', text: '\u{1F3C6} XENAHUB Mayis Turnuvasi kayitlari basladi!', active: true },
  { id: 't2', text: '\u{26A1} KralGamer_TR bu aksam 21:00\'de canlida!', active: true },
  { id: 't3', text: '\u{1F381} 5000 TL odullu Valorant turnuvasi', active: true },
];

const defaultNews: NewsItem[] = [
  { id: 'n1', title: 'XENAHUB Mayis Destek Programi Basladi', summary: 'Yeni yayıncilara ozel mentorluk ve ekipman destegi.', content: 'Bu ay baslattigimiz yeni destek programiyla 100 yeni yayınciya mentorluk, ekipman ve reklam destegi saglayacagiz.', date: '6 Mayis 2026', category: 'platform', active: true, readTime: '2 dk', likes: 234, isNew: true },
  { id: 'n2', title: 'Valorant Episode 9 Guncellemesi', summary: 'Yeni harita, yeni ajan ve buyuk meta degisiklikleri.', content: 'Valorant\'in en buyuk guncellemelerinden biri olan Episode 9 ile birlikte Pearl haritasi yenilendi.', date: '5 Mayis 2026', category: 'gaming', active: true, readTime: '3 dk', likes: 567, isNew: true },
  { id: 'n3', title: 'Turkiye Esports Sampiyonasi Finali', summary: 'Bu hafta sonu gerceklesecek final maci.', content: '5 yildir duzenledigimiz Turkiye Esports Sampiyonasi\'nin bu yilki finali Istanbul Arena\'da gerceklesecek.', date: '4 Mayis 2026', category: 'esports', active: true, readTime: '4 dk', likes: 892 },
  { id: 'n4', title: 'XENAHUB v2.5 Guncellemesi', summary: 'Sohbet filtreleme, yeni bildirim sistemi.', content: 'Bu guncellemede sohbet icin gelismis spam filtreleme eklendi.', date: '3 Mayis 2026', category: 'update', active: true, readTime: '2 dk', likes: 145 },
  { id: 'n5', title: 'GTA VI Turkiye Lansman Tarihi', summary: 'Rockstar Games, GTA VI lansmani icin ozel etkinlik planliyor.', content: 'GTA VI\'nin resmi Turkiye lansmani 2 Haziran 2026 tarihinde Istanbul\'da yapilacak.', date: '2 Mayis 2026', category: 'gaming', active: true, readTime: '3 dk', likes: 1243 },
];

const defaultEvents: EventItem[] = [
  { id: 'e1', title: 'Valorant Turkiye Turnuvasi', description: 'Aylik Valorant turnuvamiz basliyor!', date: '18 Mayis 2026', time: '20:00', location: 'Online', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256, active: true },
  { id: 'e2', title: 'Istanbul Oyuncu Bulusmasi', description: 'Surpriz konuklar ve hediyeler!', date: '25 Mayis 2026', time: '14:00', location: 'Istanbul, Kadikoy', type: 'meetup', participants: 45, maxParticipants: 100, active: true },
  { id: 'e3', title: 'Yardim Yayini - Deprem Bolgesi', description: 'Deprem bolgesindeki cocuklar icin 24 saatlik yardim yayini.', date: '1 Haziran 2026', time: '12:00', location: 'Online', type: 'charity', participants: 340, active: true },
  { id: 'e4', title: 'CS2 Pro vs Amateur', description: 'Profesyonel oyuncular amator izleyicilere karsi!', date: '8 Haziran 2026', time: '21:00', location: 'Online', type: 'tournament', prize: '2.500 TL', participants: 64, maxParticipants: 128, active: true },
  { id: 'e5', title: 'Yaz Festivali 2026', description: 'Yaz aylarinin buyuk festivali!', date: '15 Haziran 2026', time: '11:00', location: 'Ankara, ODTU Kultur Merkezi', type: 'special', participants: 200, maxParticipants: 500, active: true },
];

const defaultMarket: MarketItem[] = [
  { id: 'm1', name: 'Baslangic Paketi', description: '100 Coins', price: 300, category: 'paket', active: true, hot: true, color: '#5cff7f' },
  { id: 'm2', name: 'Orta Paket', description: '250 Coins', price: 700, category: 'paket', active: true, color: '#40a9ff' },
  { id: 'm3', name: 'Buyuk Paket', description: '500 Coins', price: 1200, category: 'paket', active: true, hot: true, color: '#9147ff' },
  { id: 'm4', name: 'VIP Uyelik 7 Gun', description: '7 gunluk VIP ayricaliklari', price: 800, category: 'uyelik', active: true, limited: true, color: '#00b3ff' },
  { id: 'm5', name: 'VIP Uyelik 30 Gun', description: '30 gunluk VIP ayricaliklari', price: 2500, category: 'uyelik', active: true, color: '#FFD700' },
  { id: 'm6', name: 'Ozel Emoji Paketi', description: '10 ozel emoji', price: 500, category: 'emote', active: true, color: '#ff6b9d' },
];

const defaultPWA: PWASettings = { name: 'XENAHUB', shortName: 'XENAHUB', themeColor: '#0a0a0f', backgroundColor: '#0a0a0f' };

/* ===== Context ===== */
interface ContentContextValue {
  ticker: TickerItem[];
  news: NewsItem[];
  events: EventItem[];
  market: MarketItem[];
  pwa: PWASettings;
  refresh: () => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [ticker, setTicker] = useState<TickerItem[]>(() => get(KEYS.ticker, defaultTicker));
  const [news, setNews] = useState<NewsItem[]>(() => get(KEYS.news, defaultNews));
  const [events, setEvents] = useState<EventItem[]>(() => get(KEYS.events, defaultEvents));
  const [market, setMarket] = useState<MarketItem[]>(() => get(KEYS.market, defaultMarket));
  const [pwa, setPwa] = useState<PWASettings>(() => get(KEYS.pwa, defaultPWA));

  // Listen for storage changes from admin panel
  useEffect(() => {
    const handler = () => {
      setTicker(get(KEYS.ticker, defaultTicker));
      setNews(get(KEYS.news, defaultNews));
      setEvents(get(KEYS.events, defaultEvents));
      setMarket(get(KEYS.market, defaultMarket));
      setPwa(get(KEYS.pwa, defaultPWA));
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const refresh = useCallback(() => {
    setTicker(get(KEYS.ticker, defaultTicker));
    setNews(get(KEYS.news, defaultNews));
    setEvents(get(KEYS.events, defaultEvents));
    setMarket(get(KEYS.market, defaultMarket));
    setPwa(get(KEYS.pwa, defaultPWA));
  }, []);

  return (
    <ContentContext.Provider value={{ ticker, news, events, market, pwa, refresh }}>
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be inside ContentProvider');
  return ctx;
}

export default ContentContext;
export { KEYS, defaultTicker, defaultNews, defaultEvents, defaultMarket, defaultPWA };
