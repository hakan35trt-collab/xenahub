import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const get = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const KEYS = { ticker: 'xenahub_admin_ticker', news: 'xenahub_admin_news', events: 'xenahub_admin_events', market: 'xenahub_admin_market', pwa: 'xenahub_admin_pwa', banners: 'xenahub_admin_banners', streamers: 'xenahub_admin_streamers' };
export interface TickerItem { id: string; text: string; active: boolean; }
export interface NewsItem { id: string; title: string; summary: string; content: string; date: string; category: string; active: boolean; readTime?: string; likes?: number; isNew?: boolean; }
export interface EventItem { id: string; title: string; description: string; date: string; time: string; location: string; type: string; prize?: string; participants: number; maxParticipants?: number; active: boolean; }
export interface MarketItem { id: string; name: string; description: string; price: number; category: string; active: boolean; hot?: boolean; limited?: boolean; color: string; }
export interface PWASettings { name: string; shortName: string; themeColor: string; backgroundColor: string; icon?: string; }
export interface BannerItem { id: string; tag: string; title: string; subtitle: string; initial: string; gradientStart: string; gradientMid: string; gradientEnd: string; active: boolean; image?: string; position?: string; }
export interface StreamerItem { id: string; name: string; realName: string; game: string; description: string; badgeLabel: string; active: boolean; image?: string; }
const defaultTicker: TickerItem[] = [
  { id: 't1', text: '?? XENAHUB Mayis Turnuvasi kayitlari basladi!', active: true },
  { id: 't2', text: '? KralGamer_TR bu aksam 21:00de canlida!', active: true },
  { id: 't3', text: '?? 5000 TL odullu Valorant turnuvasi', active: true },
];
const defaultNews: NewsItem[] = [
  { id: 'n1', title: 'XENAHUB Mayis Destek Programi Basladi', summary: 'Yeni yayincilara ozel mentorluk ve ekipman destegi.', content: 'Bu ay baslattigimiz yeni destek programiyla 100 yeni yayinciya mentorluk, ekipman ve reklam destegi saglayacagiz.', date: '6 Mayis 2026', category: 'platform', active: true, readTime: '2 dk', likes: 234, isNew: true },
  { id: 'n2', title: 'Valorant Episode 9 Guncellemesi', summary: 'Yeni harita, yeni ajan ve buyuk meta degisiklikleri.', content: 'Valorant guncellemesi yayinda.', date: '5 Mayis 2026', category: 'gaming', active: true, readTime: '3 dk', likes: 567, isNew: true },
];
const defaultEvents: EventItem[] = [
  { id: 'e1', title: 'Valorant Turkiye Turnuvasi', description: 'Aylik Valorant turnuvamiz basliyor!', date: '18 Mayis 2026', time: '20:00', location: 'Online', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256, active: true },
  { id: 'e2', title: 'Istanbul Oyuncu Bulusmasi', description: 'Surpriz konuklar ve hediyeler!', date: '25 Mayis 2026', time: '14:00', location: 'Istanbul', type: 'meetup', participants: 45, maxParticipants: 100, active: true },
];
const defaultMarket: MarketItem[] = [
  { id: 'm1', name: 'Baslangic Paketi', description: '100 Coins', price: 300, category: 'paket', active: true, hot: true, color: '#5cff7f' },
  { id: 'm2', name: 'Orta Paket', description: '250 Coins', price: 700, category: 'paket', active: true, color: '#40a9ff' },
  { id: 'm3', name: 'VIP Uyelik 7 Gun', description: '7 gunluk VIP ayricaliklari', price: 800, category: 'uyelik', active: true, limited: true, color: '#00b3ff' },
];
const defaultStreamers: StreamerItem[] = [
  { id: 's1', name: 'XENAHUB', realName: 'ModClub Ajans', game: 'Canli Yayin', description: 'Turkiye yayinci platformu', badgeLabel: 'CEO', active: true },
  { id: 's2', name: 'KralGamer', realName: 'Top Yayinci', game: 'Valorant', description: 'Aksam canli yayin', badgeLabel: 'VIP', active: true },
];
const defaultPWA: PWASettings = { name: 'XENAHUB', shortName: 'XENAHUB', themeColor: '#0a0a0f', backgroundColor: '#0a0a0f' };
const defaultBanners: BannerItem[] = [
  { id: 'b1', tag: 'XENAHUB', title: 'Premium Yayinci Platformu', subtitle: 'Turnuvalar, haberler ve market tek uygulamada', initial: 'X', gradientStart: '#1a0a3a', gradientMid: '#9147ff', gradientEnd: '#050509', active: true, position: 'Ana Banner' },
  { id: 'b2', tag: 'MODCLUB', title: 'CEO Panel Aktif', subtitle: 'Admin panelden tum icerigi yonet', initial: 'M', gradientStart: '#050509', gradientMid: '#7c3aed', gradientEnd: '#111827', active: true, position: 'Ikinci Banner' },
];
interface ContentContextValue { ticker: TickerItem[]; news: NewsItem[]; events: EventItem[]; market: MarketItem[]; pwa: PWASettings; banners: BannerItem[]; streamers: StreamerItem[]; refresh: () => void; }
const ContentContext = createContext<ContentContextValue | null>(null);
export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    const onStorage = () => refresh();
    const onFocus = () => refresh();
    const onAdmin = () => refresh();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    window.addEventListener('xenahub:content-updated', onAdmin as EventListener);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus); window.removeEventListener('xenahub:content-updated', onAdmin as EventListener); };
  }, [refresh]);
  const value = {
    ticker: get(KEYS.ticker, defaultTicker),
    news: get(KEYS.news, defaultNews),
    events: get(KEYS.events, defaultEvents),
    market: get(KEYS.market, defaultMarket),
    pwa: get(KEYS.pwa, defaultPWA),
    banners: get(KEYS.banners, defaultBanners),
    streamers: get(KEYS.streamers, defaultStreamers),
    refresh,
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
export function useContent() { const ctx = useContext(ContentContext); if (!ctx) throw new Error('useContent must be inside ContentProvider'); return ctx; }
export default ContentContext;
export { KEYS, defaultTicker, defaultNews, defaultEvents, defaultMarket, defaultPWA, defaultBanners, defaultStreamers };





