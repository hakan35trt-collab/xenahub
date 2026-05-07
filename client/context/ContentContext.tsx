import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_content') as any;
db.version(1).stores({
  banners: 'id',
  announcements: 'id',
  streamers: 'id',
  config: 'key',
});

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  tagIcon: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
  accentColor: string;
  initial: string;
  imageUrl?: string;
}

export interface Announcement {
  id: string;
  text: string;
  active: boolean;
}

export interface SplashConfig {
  title: string;
  subtitle: string;
  slogan: string;
}

export interface FeaturedStreamer {
  id: string;
  name: string;
  realName?: string;
  description?: string;
  imageUrl?: string;
  badgeLabel: string;
  game?: string;
  active: boolean;
}

const DEFAULT_BANNERS: BannerItem[] = [
  { id: 'b1', title: 'KralGamer_TR', subtitle: 'Bu akşam 21:00\'de canlı yayında! Valorant rekabetçi maçlar sizi bekliyor.', tag: 'CANLI', tagIcon: 'radio', gradientStart: '#9147ff', gradientMid: '#6441a4', gradientEnd: '#1a0a3a', accentColor: '#bf94ff', initial: 'K' },
  { id: 'b2', title: 'Valorant Turnuvası', subtitle: '5.000 TL ödüllü büyük turnuva 18 Mayıs\'ta başlıyor. Hemen kayıt ol!', tag: 'TURNUVA', tagIcon: 'trophy', gradientStart: '#c89b14', gradientMid: '#8b6914', gradientEnd: '#2a1f00', accentColor: '#FFD700', initial: 'T' },
  { id: 'b3', title: 'İstanbul Buluşması', subtitle: '25 Mayıs\'ta Kadıköy\'de görüşüyoruz. Sürpriz konuklar ve hediyeler!', tag: 'ETKİNLİK', tagIcon: 'account-group', gradientStart: '#0070cc', gradientMid: '#004f99', gradientEnd: '#001a33', accentColor: '#40a9ff', initial: 'B' },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', text: '🏆  XENAHUB Mayıs Turnuvası kayıtları başladı!', active: true },
  { id: 'a2', text: '⚡  KralGamer_TR bu akşam 21:00\'de canlıda!', active: true },
  { id: 'a3', text: '🎁  5000 TL ödüllü Valorant turnuvası — Kayıt için Etkinlikler sekmesine git', active: true },
  { id: 'a4', text: '🌟  Ayın Yayıncısı oylaması başladı — Oy kullan!', active: true },
];

const DEFAULT_SPLASH: SplashConfig = {
  title: 'Türkiye\'nin Yayıncı Platformu',
  subtitle: 'BİZE ÜYE DEĞİL DOST LAZIM',
  slogan: '',
};

const DEFAULT_FEATURED: FeaturedStreamer[] = [
  { id: 'fs1', name: 'KralGamer_TR', realName: 'Mert Yılmaz', description: 'Türkiye\'nin en iyi Valorant yayıncısı! Her gece 21:00\'de canlıda.', game: 'Valorant', badgeLabel: 'AYIN YAYINCISI', active: true },
  { id: 'fs2', name: 'ZeynepPlay', realName: 'Zeynep Kaya', description: 'FPS ve strateji oyunlarında bu haftanın yıldızı!', game: 'CS2', badgeLabel: 'HAFTANIN YAYINCISI', active: true },
];

interface ContentContextValue {
  banners: BannerItem[];
  announcements: Announcement[];
  splashConfig: SplashConfig;
  featuredStreamers: FeaturedStreamer[];
  addBanner: (b: Omit<BannerItem, 'id'>) => void;
  updateBanner: (id: string, b: Partial<BannerItem>) => void;
  deleteBanner: (id: string) => void;
  addAnnouncement: (text: string) => void;
  updateAnnouncement: (id: string, changes: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  updateSplashConfig: (changes: Partial<SplashConfig>) => void;
  addFeaturedStreamer: (s: Omit<FeaturedStreamer, 'id'>) => void;
  updateFeaturedStreamer: (id: string, changes: Partial<FeaturedStreamer>) => void;
  deleteFeaturedStreamer: (id: string) => void;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [splashConfig, setSplashConfig] = useState<SplashConfig>(DEFAULT_SPLASH);
  const [featuredStreamers, setFeaturedStreamers] = useState<FeaturedStreamer[]>(DEFAULT_FEATURED);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [b, a, s, f] = await Promise.all([
        db.banners.toArray(),
        db.announcements.toArray(),
        db.config.get('splash'),
        db.config.get('featured'),
      ]);
      if (b && b.length > 0) setBanners(b);
      if (a && a.length > 0) setAnnouncements(a);
      if (s) setSplashConfig({ ...DEFAULT_SPLASH, ...s.data });
      if (f) setFeaturedStreamers(f.data);
    } catch { /* ignore */ }
  };

  const saveBanners = async (data: BannerItem[]) => {
    await db.banners.clear();
    await db.banners.bulkPut(data);
  };
  const saveAnnouncements = async (data: Announcement[]) => {
    await db.announcements.clear();
    await db.announcements.bulkPut(data);
  };
  const saveSplash = async (data: SplashConfig) => {
    await db.config.put({ key: 'splash', data });
  };
  const saveFeatured = async (data: FeaturedStreamer[]) => {
    await db.config.put({ key: 'featured', data });
  };

  const addBanner = useCallback((b: Omit<BannerItem, 'id'>) => {
    setBanners((prev) => { const next = [...prev, { ...b, id: Date.now().toString() }]; saveBanners(next); return next; });
  }, []);
  const updateBanner = useCallback((id: string, changes: Partial<BannerItem>) => {
    setBanners((prev) => { const next = prev.map((b) => (b.id === id ? { ...b, ...changes } : b)); saveBanners(next); return next; });
  }, []);
  const deleteBanner = useCallback((id: string) => {
    setBanners((prev) => { const next = prev.filter((b) => b.id !== id); saveBanners(next); return next; });
  }, []);

  const addAnnouncement = useCallback((text: string) => {
    setAnnouncements((prev) => { const next = [...prev, { id: Date.now().toString(), text, active: true }]; saveAnnouncements(next); return next; });
  }, []);
  const updateAnnouncement = useCallback((id: string, changes: Partial<Announcement>) => {
    setAnnouncements((prev) => { const next = prev.map((a) => (a.id === id ? { ...a, ...changes } : a)); saveAnnouncements(next); return next; });
  }, []);
  const deleteAnnouncement = useCallback((id: string) => {
    setAnnouncements((prev) => { const next = prev.filter((a) => a.id !== id); saveAnnouncements(next); return next; });
  }, []);

  const updateSplashConfig = useCallback((changes: Partial<SplashConfig>) => {
    setSplashConfig((prev) => { const next = { ...prev, ...changes }; saveSplash(next); return next; });
  }, []);

  const addFeaturedStreamer = useCallback((s: Omit<FeaturedStreamer, 'id'>) => {
    setFeaturedStreamers((prev) => { const next = [...prev, { ...s, id: Date.now().toString() }]; saveFeatured(next); return next; });
  }, []);
  const updateFeaturedStreamer = useCallback((id: string, changes: Partial<FeaturedStreamer>) => {
    setFeaturedStreamers((prev) => { const next = prev.map((s) => (s.id === id ? { ...s, ...changes } : s)); saveFeatured(next); return next; });
  }, []);
  const deleteFeaturedStreamer = useCallback((id: string) => {
    setFeaturedStreamers((prev) => { const next = prev.filter((s) => s.id !== id); saveFeatured(next); return next; });
  }, []);

  return (
    <ContentContext.Provider value={{
      banners, announcements, splashConfig, featuredStreamers,
      addBanner, updateBanner, deleteBanner,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      updateSplashConfig,
      addFeaturedStreamer, updateFeaturedStreamer, deleteFeaturedStreamer,
    }}>
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
