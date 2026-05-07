import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Calendar, FileText, Crown } from 'lucide-react';
import { useContent } from '../context/ContentContext';
import TopBar from '../components/TopBar';

const NEWS_COLORS: Record<string, string> = { platform: '#9147ff', gaming: '#00b3ff', esports: '#FFD700', update: '#00ad03' };
const NEWS_LABELS: Record<string, string> = { platform: 'Platform', gaming: 'Oyun', esports: 'Esports', update: 'Guncelleme' };
const EVT_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  tournament: { icon: '??', color: '#FFD700', label: 'Turnuva' },
  meetup: { icon: '??', color: '#00b3ff', label: 'Bulusma' },
  charity: { icon: '??', color: '#ff6b6b', label: 'Yardim' },
  special: { icon: '?', color: '#9147ff', label: 'Ozel' },
};

function MarqueeBar() {
  const { ticker } = useContent();
  const active = ticker.filter((a) => a.active);
  if (!active.length) return null;
  const text = active.map((a) => a.text).join('  ?  ');
  return <div className="bg-xena-primary/10 border-y border-xena-primary/20 overflow-hidden py-1.5"><div className="marquee-track"><span className="text-xs font-semibold text-xena-accent pl-4">{text} ? {text}</span></div></div>;
}

function BannerCarousel() {
  const { banners } = useContent();
  const active = banners.filter((b: any) => b.active);
  const [idx, setIdx] = useState(0);
  React.useEffect(() => { if (active.length <= 1) return; const t = setInterval(() => setIdx((p) => (p + 1) % active.length), 4000); return () => clearInterval(t); }, [active.length]);
  const b = active[idx] || active[0];
  if (!b) return null;
  return (
    <div className="relative w-full h-[170px] mx-[-16px] px-4 overflow-hidden">
      <div className="relative h-full rounded-2xl overflow-hidden" style={{ background: b.image ? `linear-gradient(135deg, rgba(0,0,0,.55), rgba(0,0,0,.25)), url(${b.image}) center/cover` : `linear-gradient(135deg, ${b.gradientStart} 0%, ${b.gradientMid} 50%, ${b.gradientEnd} 100%)` }}>
        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between"><span className="text-xs font-extrabold bg-white/15 rounded-full px-3 py-1 border border-white/20">{b.tag}</span><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg font-black">{b.initial}</div></div>
          <div><h3 className="text-xl font-black text-white">{b.title}</h3><p className="text-xs text-white/80 mt-1">{b.subtitle}</p></div>
        </div>
      </div>
    </div>
  );
}

function StreamerCarousel() {
  return (
    <div className="relative w-full h-[200px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a0a3a] via-[#9147ff] to-[#1a0a3a]">
      <div className="absolute inset-0 flex items-center px-5">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-1.5 bg-xena-primary/30 border border-xena-primary/60 rounded-full px-2.5 py-1 w-fit"><Star size={10} className="text-xena-gold" /><span className="text-[10px] font-extrabold text-xena-accent tracking-wide">CEO</span></div>
          <h3 className="text-2xl font-black text-white">XENAHUB</h3><p className="text-[13px] text-white/70">ModClub Ajans</p><div className="bg-xena-primary/25 rounded-xl px-2.5 py-1 w-fit"><span className="text-xs font-bold text-xena-accent">Canli Yayin</span></div><p className="text-xs text-white/75 line-clamp-2">Turkiye yayinci platformu</p>
        </div>
        <div className="w-[84px] h-[84px] rounded-full border-2 border-xena-primary/80 bg-gradient-to-br from-xena-primary to-xena-primary/40 flex items-center justify-center shrink-0"><span className="text-3xl font-black text-white">X</span></div>
      </div>
    </div>
  );
}

function NewsCard({ item }: { item: any }) {
  const [liked, setLiked] = useState(false);
  const color = NEWS_COLORS[item.category] || '#9147ff';
  return <div className="card mx-4 p-3.5 mb-2.5"><div className="flex items-center gap-2 mb-2"><span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{NEWS_LABELS[item.category] || item.category || 'Haber'}</span>{item.isNew && <span className="text-[9px] font-extrabold bg-xena-danger text-white px-1.5 py-0.5 rounded-md">YENI</span>}</div><h4 className="text-sm font-bold text-white line-clamp-2">{item.title}</h4><p className="text-xs text-xena-muted line-clamp-2 mt-1">{item.summary}</p><div className="flex items-center justify-between mt-2"><span className="text-[11px] text-xena-muted">{item.date}</span><button onClick={() => setLiked(!liked)} className="flex items-center gap-1"><Heart size={13} className={liked ? 'text-xena-danger fill-xena-danger' : 'text-xena-muted'} /><span className={`text-xs font-semibold ${liked ? 'text-xena-danger' : 'text-xena-muted'}`}>{(item.likes ?? 0) + (liked ? 1 : 0)}</span></button></div></div>;
}

function EventCard({ item }: { item: any }) {
  const [registered, setRegistered] = useState(() => { try { return JSON.parse(localStorage.getItem('xenahub_home_joined') || '[]').includes(item.id); } catch { return false; } });
  const cfg = EVT_CONFIG[item.type] || EVT_CONFIG.special;
  const pct = item.maxParticipants ? Math.min((item.participants / item.maxParticipants) * 100, 100) : null;
  return <div className="card w-[72vw] shrink-0 p-3.5"><div className="flex items-center gap-2 mb-2"><span className="text-[11px] font-bold px-2 py-1 rounded-full border flex items-center gap-1" style={{ background: `${cfg.color}18`, borderColor: `${cfg.color}35`, color: cfg.color }}>{cfg.icon} {cfg.label}</span>{item.prize && <span className="text-[11px] font-bold text-xena-gold bg-xena-gold/10 px-2 py-1 rounded-full">{item.prize}</span>}</div><h4 className="text-[15px] font-bold text-white line-clamp-1">{item.title}</h4><p className="text-xs text-xena-muted line-clamp-2 mt-1 mb-2">{item.description}</p><div className="space-y-1 mb-3"><div className="flex items-center gap-1.5 text-xs text-xena-muted"><Calendar size={11} className="text-xena-primary" /> {item.date}</div><div className="flex items-center gap-1.5 text-xs text-xena-muted"><span>?</span> {item.time}</div></div>{pct !== null && <div className="space-y-1 mb-3"><div className="flex justify-between text-xs"><span className="text-xena-muted">{item.participants}/{item.maxParticipants}</span><span className="font-bold text-xena-accent">%{Math.round(pct)}</span></div><div className="h-1 bg-xena-surface rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? '#ff4444' : '#9147ff' }} /></div></div>}<button onClick={() => { const raw = localStorage.getItem('xenahub_home_joined') || '[]'; const ids = JSON.parse(raw); const next = registered ? ids.filter((x: string) => x !== item.id) : [...ids, item.id]; localStorage.setItem('xenahub_home_joined', JSON.stringify(next)); setRegistered(!registered); }} className={`w-full py-2 rounded-xl text-sm font-bold active:scale-[0.96] ${registered ? 'bg-xena-surface text-xena-muted border border-white/10' : 'btn-primary'}`}>{registered ? 'Kaydi Iptal Et' : 'Katil'}</button></div>;
}

export default function HomePage() {
  const { news, events } = useContent();
  return <div className="min-h-dvh bg-xena-bg pb-20"><TopBar /><MarqueeBar /><div className="space-y-5 mt-4 px-4"><section><BannerCarousel /></section><section className="mx-[-16px] px-4"><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg bg-xena-gold/10 flex items-center justify-center"><Crown size={14} className="text-xena-gold" /></div><h2 className="text-base font-extrabold text-white">One Cikan Yayincilar</h2></div><StreamerCarousel /></section><section><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg bg-xena-primary/10 flex items-center justify-center"><Calendar size={14} className="text-xena-primary" /></div><h2 className="text-base font-extrabold text-white">Etkinlikler</h2></div><div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">{events.filter(e => e.active).slice(0,4).map(e => <EventCard key={e.id} item={e} />)}</div></section><section><div className="flex items-center gap-2 mb-3"><div className="w-7 h-7 rounded-lg bg-xena-info/10 flex items-center justify-center"><FileText size={14} className="text-xena-info" /></div><h2 className="text-base font-extrabold text-white">Haberler</h2></div>{news.filter(n => n.active).slice(0,5).map(n => <NewsCard key={n.id} item={n} />)}</section></div></div>;
}



