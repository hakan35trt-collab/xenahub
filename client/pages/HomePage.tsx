import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Calendar, FileText, Crown, ChevronRight } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import TopBar from '../components/TopBar';

function MarqueeBar() {
  const { ticker } = useContent();
  const active = ticker.filter((a) => a.active);
  if (!active.length) return null;
  const text = active.map((a) => a.text).join('  ⚡  ');
  return (
    <div className="bg-xena-primary/10 border-y border-xena-primary/20 overflow-hidden py-1.5">
      <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite]">
        <span className="text-xs font-semibold text-xena-accent pl-4">{text}  ⚡  {text}</span>
      </div>
    </div>
  );
}

function StreamerCarousel() {
  const featuredStreamers = [] as any[];
  const [activeIdx, setActiveIdx] = useState(0);
  const items = featuredStreamers.filter((s) => s.active);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (items.length <= 1) return;
    autoRef.current = setInterval(() => setActiveIdx((p) => (p + 1) % items.length), 3800);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div className="relative w-full h-[200px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a3a] via-[#9147ff] to-[#1a0a3a]" />
          <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-xena-primary/10" />
          <div className="absolute bottom-[-30px] left-5 w-[130px] h-[130px] rounded-full bg-xena-primary/5" />
          <div className="absolute inset-0 flex items-center px-5">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5 bg-xena-primary/30 border border-xena-primary/60 rounded-full px-2.5 py-1 w-fit">
                <Star size={10} className="text-xena-gold" />
                <span className="text-[10px] font-extrabold text-xena-accent tracking-wide">{items[activeIdx].badgeLabel}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{items[activeIdx].name}</h3>
              {items[activeIdx].realName && <p className="text-[13px] text-white/70">{items[activeIdx].realName}</p>}
              {items[activeIdx].game && (
                <div className="bg-xena-primary/25 rounded-xl px-2.5 py-1 w-fit">
                  <span className="text-xs font-bold text-xena-accent">{items[activeIdx].game}</span>
                </div>
              )}
              {items[activeIdx].description && <p className="text-xs text-white/75 line-clamp-2">{items[activeIdx].description}</p>}
            </div>
            <div className="w-[84px] h-[84px] rounded-full border-2 border-xena-primary/80 bg-gradient-to-br from-xena-primary to-xena-primary/40 flex items-center justify-center shrink-0">
              <span className="text-3xl font-black text-white">{items[activeIdx].name[0]?.toUpperCase()}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {items.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIdx ? 'w-5 bg-white' : 'w-1.5 bg-white/35'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BannerCarousel() {
  const banners = [] as any[];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[idx];
  if (!b) return null;

  return (
    <div className="relative w-full h-[160px] mx-[-16px] px-4 overflow-hidden">
      <motion.div
        key={idx}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative h-full rounded-2xl overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${b.gradientStart} 0%, ${b.gradientMid} 50%, ${b.gradientEnd} 100%)` }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">{b.tag}</span>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-black">{b.initial}</div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{b.title}</h3>
            <p className="text-xs text-white/80 line-clamp-2 mt-0.5">{b.subtitle}</p>
          </div>
        </div>
      </motion.div>
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/40'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

interface NewsItem { id: string; title: string; summary: string; date: string; category: string; isNew?: boolean; likes: number; }
const NEWS: NewsItem[] = [
  { id: 'n1', title: 'XENAHUB Mayıs Destek Programı Başladı', summary: 'Yeni yayıncılara özel mentörlük ve ekipman desteği sunmaya başlıyoruz.', date: '6 Mayıs 2026', category: 'platform', isNew: true, likes: 234 },
  { id: 'n2', title: 'Valorant Episode 9 Güncellemesi Geldi', summary: 'Yeni harita, yeni ajan ve büyük meta değişiklikleri ile Episode 9 başladı.', date: '5 Mayıs 2026', category: 'gaming', isNew: true, likes: 567 },
  { id: 'n3', title: 'Türkiye Esports Şampiyonası Finali', summary: 'Bu hafta sonu gerçekleşecek final maçı için biletler satışa çıktı.', date: '4 Mayıs 2026', category: 'esports', likes: 892 },
  { id: 'n4', title: 'XENAHUB v2.5 Güncellemesi Yayında', summary: 'Sohbet filtreleme, yeni bildirim sistemi ve performans iyileştirmeleri.', date: '3 Mayıs 2026', category: 'update', likes: 145 },
  { id: 'n5', title: 'GTA VI Türkiye Lansmanı Tarihi Açıklandı', summary: 'Rockstar Games, GTA VI\'nın Türkiye lansmanı için özel etkinlik planlıyor.', date: '2 Mayıs 2026', category: 'gaming', likes: 1243 },
];
const NEWS_COLORS: Record<string, string> = { platform: '#9147ff', gaming: '#00b3ff', esports: '#FFD700', update: '#00ad03' };
const NEWS_LABELS: Record<string, string> = { platform: 'Platform', gaming: 'Oyun', esports: 'Esports', update: 'Güncelleme' };

function NewsCard({ item }: { item: NewsItem }) {
  const [liked, setLiked] = useState(false);
  return (
    <div className="card mx-4 p-3.5 mb-2.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${NEWS_COLORS[item.category]}18`, color: NEWS_COLORS[item.category] }}>{NEWS_LABELS[item.category]}</span>
        {item.isNew && <span className="text-[9px] font-extrabold bg-xena-danger text-white px-1.5 py-0.5 rounded-md">YENİ</span>}
      </div>
      <h4 className="text-sm font-bold text-white line-clamp-2">{item.title}</h4>
      <p className="text-xs text-xena-muted line-clamp-2 mt-1">{item.summary}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-xena-muted">{item.date}</span>
        <button onClick={() => setLiked(!liked)} className="flex items-center gap-1">
          <Heart size={13} className={liked ? 'text-xena-danger fill-xena-danger' : 'text-xena-muted'} />
          <span className={`text-xs font-semibold ${liked ? 'text-xena-danger' : 'text-xena-muted'}`}>{item.likes + (liked ? 1 : 0)}</span>
        </button>
      </div>
    </div>
  );
}

interface EventItem { id: string; title: string; description: string; date: string; time: string; type: 'tournament' | 'meetup' | 'charity' | 'special'; prize?: string; participants: number; maxParticipants?: number; }
const EVENTS: EventItem[] = [
  { id: 'e1', title: 'Valorant Türkiye Turnuvası', description: 'Aylık Valorant turnuvamız başlıyor! 5\'er kişilik takımlar halinde katılın.', date: '18 Mayıs 2026', time: '20:00', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256 },
  { id: 'e2', title: 'İstanbul Oyuncu Buluşması', description: 'İstanbul\'daki yayıncılarımız ve izleyicilerimizle bir araya geliyoruz.', date: '25 Mayıs 2026', time: '14:00', type: 'meetup', participants: 45, maxParticipants: 100 },
  { id: 'e3', title: 'Yardım Yayını - Deprem Bölgesi', description: 'Deprem bölgesindeki çocuklar için 24 saatlik yardım yayını.', date: '1 Haziran 2026', time: '12:00', type: 'charity', participants: 340 },
  { id: 'e4', title: 'CS2 Pro vs Amateur', description: 'Profesyonel oyuncular amatör izleyicilere karşı! Siz de katılabilirsiniz.', date: '8 Haziran 2026', time: '21:00', type: 'tournament', prize: '2.500 TL', participants: 64, maxParticipants: 128 },
];
const EVT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  tournament: { icon: '🏆', color: '#FFD700', label: 'Turnuva' },
  meetup: { icon: '👥', color: '#00b3ff', label: 'Buluşma' },
  charity: { icon: '❤️', color: '#ff6b6b', label: 'Yardım' },
  special: { icon: '⭐', color: '#9147ff', label: 'Özel' },
};

function EventCard({ item }: { item: EventItem }) {
  const [registered, setRegistered] = useState(false);
  const cfg = EVT_CONFIG[item.type];
  const pct = item.maxParticipants ? Math.min((item.participants / item.maxParticipants) * 100, 100) : null;
  return (
    <div className="card w-[72vw] shrink-0 p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] font-bold px-2 py-1 rounded-full border flex items-center gap-1" style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}35`, color: cfg.color }}>
          {cfg.icon} {cfg.label}
        </span>
        {item.prize && <span className="text-[11px] font-bold text-xena-gold bg-xena-gold/10 px-2 py-1 rounded-full">{item.prize}</span>}
      </div>
      <h4 className="text-[15px] font-bold text-white line-clamp-1">{item.title}</h4>
      <p className="text-xs text-xena-muted line-clamp-2 mt-1 mb-2">{item.description}</p>
      <div className="space-y-1 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-xena-muted"><Calendar size={11} className="text-xena-primary" /> {item.date}</div>
        <div className="flex items-center gap-1.5 text-xs text-xena-muted"><span>⏰</span> {item.time}</div>
      </div>
      {pct !== null && (
        <div className="space-y-1 mb-3">
          <div className="flex justify-between text-xs"><span className="text-xena-muted">{item.participants}/{item.maxParticipants}</span><span className="font-bold text-xena-accent">%{Math.round(pct)}</span></div>
          <div className="h-1 bg-xena-surface rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct > 80 ? '#ff4444' : '#9147ff' }} /></div>
        </div>
      )}
      <button onClick={() => setRegistered(!registered)} className={`w-full py-2 rounded-xl text-sm font-bold transition-all active:scale-[0.96] ${registered ? 'bg-xena-surface text-xena-muted border border-white/10' : 'btn-primary'}`}>
        {registered ? 'Kaydı İptal Et' : 'Katıl'}
      </button>
    </div>
  );
}

export default function HomePage() {
  const { news, events } = useContent();
  return (
    <div className="min-h-dvh bg-xena-bg pb-20">
      <TopBar />
      <MarqueeBar />

      <div className="space-y-5 mt-4 px-4">
        {/* Banner Carousel */}
        <section>
          <BannerCarousel />
        </section>

        {/* Featured Streamers */}
        <section className="mx-[-16px] px-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-xena-gold/10 flex items-center justify-center"><Crown size={14} className="text-xena-gold" /></div>
            <h2 className="text-base font-extrabold text-white">Öne Çıkan Yayıncılar</h2>
          </div>
          <StreamerCarousel />
        </section>

        {/* Events */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-xena-primary/10 flex items-center justify-center"><Calendar size={14} className="text-xena-primary" /></div>
            <h2 className="text-base font-extrabold text-white">Etkinlikler</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
            {events.filter(e => e.active).slice(0,4).map((e) => <EventCard key={e.id} item={e as any} />)}
          </div>
        </section>

        {/* News */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-xena-info/10 flex items-center justify-center"><FileText size={14} className="text-xena-info" /></div>
            <h2 className="text-base font-extrabold text-white">Haberler</h2>
          </div>
          {news.filter(n => n.active).slice(0,5).map((n) => <NewsCard key={n.id} item={n as any} />)}
        </section>
      </div>
    </div>
  );
}


