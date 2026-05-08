import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Users, MessageSquare, Ticket, TrendingUp, Ban,
  Crown, Star, CheckCircle, XCircle, Plus, Trash2, Edit3, Save, X,
  Megaphone, ShoppingBag, Newspaper, Calendar, AlertTriangle, Eye, EyeOff, ChevronRight,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

/* ========== Shared Types ========== */
interface TickerItem { id: string; text: string; active: boolean; }
interface NewsItem { id: string; title: string; summary: string; content: string; date: string; category: string; active: boolean; }
interface EventItem { id: string; title: string; description: string; date: string; time: string; location: string; type: string; prize?: string; participants: number; maxParticipants?: number; active: boolean; }
interface MarketItem { id: string; name: string; description: string; price: number; category: string; active: boolean; hot?: boolean; limited?: boolean; color: string; }
interface PWASettings { name: string; shortName: string; themeColor: string; backgroundColor: string; icon?: string; }
interface BannerItem { id: string; tag: string; title: string; subtitle: string; initial: string; gradientStart: string; gradientMid: string; gradientEnd: string; active: boolean; image?: string; }
interface StreamerItem { id: string; name: string; realName: string; game: string; description: string; badgeLabel: string; active: boolean; image?: string; }

/* ========== Storage Helpers ========== */
const get = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const set = <T,>(key: string, data: T) => { localStorage.setItem(key, JSON.stringify(data)); window.dispatchEvent(new CustomEvent('xenahub:content-updated')); };

const S = {
  ticker: 'xenahub_admin_ticker',
  news: 'xenahub_admin_news',
  events: 'xenahub_admin_events',
  market: 'xenahub_admin_market',
  users: 'xenahub_admin_users',
  pwa: 'xenahub_admin_pwa',
  banners: 'xenahub_admin_banners',
  streamers: 'xenahub_admin_streamers',
};

const defaultTicker: TickerItem[] = [
  { id: 't1', text: '\u{1F3C6} XENAHUB Mayis Turnuvasi kayitlari basladi!', active: true },
  { id: 't2', text: '\u{26A1} KralGamer_TR bu aksam 21:00\'de canlida!', active: true },
  { id: 't3', text: '\u{1F381} 5000 TL odullu Valorant turnuvasi', active: true },
];

const defaultNews: NewsItem[] = [
  { id: 'n1', title: 'XENAHUB Mayis Destek Programi Basladi', summary: 'Yeni yayncilara ozel mentorluk ve ekipman destegi.', content: 'Bu ay baslattigimiz yeni destek programiyla 100 yeni yaynciya mentorluk, ekipman ve reklam destegi saglayacagiz.', date: '6 Mayis 2026', category: 'platform', active: true },
  { id: 'n2', title: 'Valorant Episode 9 Guncellemesi', summary: 'Yeni harita, yeni ajan ve buyuk meta degisiklikleri.', content: 'Valorant\'in en buyuk guncellemelerinden biri olan Episode 9 ile birlikte Pearl haritasi yenilendi.', date: '5 Mayis 2026', category: 'gaming', active: true },
];

const defaultEvents: EventItem[] = [
  { id: 'e1', title: 'Valorant Turkiye Turnuvasi', description: 'Aylik Valorant turnuvamiz basliyor!', date: '18 Mayis 2026', time: '20:00', location: 'Online', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256, active: true },
  { id: 'e2', title: 'Istanbul Oyuncu Bulusmasi', description: 'Srpriz konuklar ve hediyeler!', date: '25 Mayis 2026', time: '14:00', location: 'Istanbul, Kadikoy', type: 'meetup', participants: 45, maxParticipants: 100, active: true },
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
  { id: 'b1', tag: 'XENAHUB', title: 'Premium Yayinci Platformu', subtitle: 'Turnuvalar, haberler ve market tek uygulamada', initial: 'X', gradientStart: '#1a0a3a', gradientMid: '#9147ff', gradientEnd: '#050509', active: true },
  { id: 'b2', tag: 'MODCLUB', title: 'CEO Panel Aktif', subtitle: 'Admin panelden tum icerigi yonet', initial: 'M', gradientStart: '#050509', gradientMid: '#7c3aed', gradientEnd: '#111827', active: true },
];

function updatePwaMeta(settings: PWASettings) {
  document.title = settings.name;
  document.querySelector('meta[name="application-name"]')?.setAttribute('content', settings.name);
  document.querySelector('meta[name="apple-mobile-web-app-title"]')?.setAttribute('content', settings.shortName);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.themeColor);
  window.dispatchEvent(new CustomEvent('xenahub:content-updated'));
}

function PWAManager() {
  const [settings, setSettings] = useState<PWASettings>(() => get(S.pwa, defaultPWA));
  const savePWA = () => { set(S.pwa, settings); updatePwaMeta(settings); alert("PWA ayarlari kaydedildi"); };
  const handleIcon = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Sadece resim yukleyin'); return; }
    if (file.size > 700 * 1024) { alert('Icon dosyasi cok buyuk. 700KB altinda PNG/JPG yukleyin.'); return; }
    const reader = new FileReader();
    reader.onerror = () => alert('Icon okunamadi');
    reader.onload = () => { try { setSettings(prev => ({ ...prev, icon: String(reader.result) })); } catch { alert('Icon yuklenemedi'); } };
    reader.readAsDataURL(file);
  };
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider mb-2">PWA Uygulama Ayarlari</h3>
      <div className="glass rounded-2xl p-4 border border-xena-primary/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-xena-primary/20 flex items-center justify-center overflow-hidden border border-xena-primary/30">
            {settings.icon ? <img src={settings.icon} className="w-full h-full object-cover" /> : <span className="text-2xl font-black text-xena-primary">X</span>}
          </div>
          <label className="bg-xena-primary text-white px-4 py-2 rounded-xl text-sm font-bold active:scale-95 cursor-pointer">
            Icon Yukle
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleIcon(e.target.files?.[0])} />
          </label>
        </div>
        <Input label="Uygulama Adi" value={settings.name} onChange={v => setSettings(prev => ({ ...prev, name: v }))} />
        <Input label="Kisa Ad" value={settings.shortName} onChange={v => setSettings(prev => ({ ...prev, shortName: v }))} />
        <Input label="Tema Rengi" value={settings.themeColor} onChange={v => setSettings(prev => ({ ...prev, themeColor: v }))} />
        <Input label="Arka Plan Rengi" value={settings.backgroundColor} onChange={v => setSettings(prev => ({ ...prev, backgroundColor: v }))} />
        <button onClick={savePWA} className="w-full bg-xena-primary text-white py-3 rounded-xl font-bold text-sm mt-2 flex items-center justify-center gap-2"><Save size={14} /> Kaydet</button><p className="text-xs text-xena-muted leading-relaxed mt-2">Not: PWA ismi/iconu yeni yuklemelerde guncellenir. Eski yuklu uygulamalar icin kaldirip yeniden yuklemek gerekebilir.</p>
      </div>
    </div>
  );
}
/* ========== Reusable Components ========== */
function Input({ label, value, onChange, type = 'text', placeholder = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-xena-muted font-bold uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-xena-muted/50 focus:border-xena-primary outline-none transition-colors"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-xena-muted font-bold uppercase tracking-wider mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:border-xena-primary outline-none transition-colors"
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-4 border border-white/[0.04] ${className}`}>{children}</div>;
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${active ? 'bg-xena-primary' : 'bg-white/10'}`}>
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

/* ========== Manage Sections ========== */
function TickerManager() {
  const [items, setItems] = useState<TickerItem[]>(() => get(S.ticker, defaultTicker));
  const [text, setText] = useState('');

  useEffect(() => { set(S.ticker, items); }, [items]);

  const add = () => {
    if (!text.trim()) return;
    setItems(prev => [...prev, { id: Date.now().toString(), text: text.trim(), active: true }]);
    setText('');
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider mb-2">Kayan Duyuru Ekle</h3>
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Yeni duyuru yazisi..." className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-xena-muted/50 focus:border-xena-primary outline-none" onKeyDown={e => e.key === 'Enter' && add()} />
        <button onClick={add} className="bg-xena-primary hover:bg-xena-primary/80 text-white px-4 py-2.5 rounded-xl font-bold active:scale-95 transition-all"><Plus size={18} /></button>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3">
            <Toggle active={item.active} onToggle={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))} />
            <span className={`flex-1 text-sm ${item.active ? 'text-white' : 'text-xena-muted line-through'}`}>{item.text}</span>
            <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xena-danger/60 hover:text-xena-danger p-1"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsManager() {
  const [items, setItems] = useState<NewsItem[]>(() => get(S.news, defaultNews));
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<NewsItem>>({});

  useEffect(() => { set(S.news, items); }, [items]);

  const setupForm = (item?: NewsItem) => {
    setEditing(item?.id || 'new');
    setForm(item ? { ...item } : { title: '', summary: '', content: '', date: new Date().toLocaleDateString('tr-TR'), category: 'platform', active: true });
  };

  const save = () => {
    if (!form.title?.trim() || !form.summary?.trim()) return;
    if (editing === 'new') {
      setItems(prev => [...prev, { ...(form as NewsItem), id: Date.now().toString() }]);
    } else {
      setItems(prev => prev.map(i => i.id === editing ? { ...i, ...form } as NewsItem : i));
    }
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider">Haberleri Yonet</h3>
        <button onClick={() => setupForm()} className="flex items-center gap-1 bg-xena-primary/15 text-xena-primary px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95"><Plus size={14} /> Yeni</button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-4 border border-xena-primary/20 mb-4">
            <h4 className="font-bold text-sm mb-3">{editing === 'new' ? 'Yeni Haber' : 'Haberi Duzenle'}</h4>
            <Input label="Baslik" value={form.title || ''} onChange={v => setForm({ ...form, title: v })} />
            <Input label="Ozet" value={form.summary || ''} onChange={v => setForm({ ...form, summary: v })} />
            <textarea value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Icerik..." className="w-full h-24 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-xena-muted/50 focus:border-xena-primary outline-none mb-3 resize-none" />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Tarih" value={form.date || ''} onChange={v => setForm({ ...form, date: v })} />
              <Select label="Kategori" value={form.category || 'platform'} onChange={v => setForm({ ...form, category: v })} options={['platform', 'gaming', 'esports', 'update']} />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={save} className="flex-1 bg-xena-primary text-white py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1"><Save size={14} /> Kaydet</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-xena-muted text-sm font-bold"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3">
            <Toggle active={item.active} onToggle={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{item.title}</div>
              <div className="text-[10px] text-xena-muted">{item.date}  {item.category}</div>
            </div>
            <button onClick={() => setupForm(item)} className="text-xena-primary/60 hover:text-xena-primary p-1"><Edit3 size={14} /></button>
            <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xena-danger/60 hover:text-xena-danger p-1"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventManager() {
  const [items, setItems] = useState<EventItem[]>(() => get(S.events, defaultEvents));
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<EventItem>>({});

  useEffect(() => { set(S.events, items); }, [items]);

  const setupForm = (item?: EventItem) => {
    setEditing(item?.id || 'new');
    setForm(item ? { ...item } : { title: '', description: '', date: '', time: '20:00', location: 'Online', type: 'tournament', participants: 0, active: true });
  };

  const save = () => {
    if (!form.title?.trim()) return;
    if (editing === 'new') {
      setItems(prev => [...prev, { ...(form as EventItem), id: Date.now().toString() }]);
    } else {
      setItems(prev => prev.map(i => i.id === editing ? { ...i, ...form } as EventItem : i));
    }
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider">Etkinlikleri Yonet</h3>
        <button onClick={() => setupForm()} className="flex items-center gap-1 bg-xena-primary/15 text-xena-primary px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95"><Plus size={14} /> Yeni</button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-4 border border-xena-primary/20 mb-4">
            <h4 className="font-bold text-sm mb-3">{editing === 'new' ? 'Yeni Etkinlik' : 'Etkinligi Duzenle'}</h4>
            <Input label="Baslik" value={form.title || ''} onChange={v => setForm({ ...form, title: v })} />
            <Input label="Aciklama" value={form.description || ''} onChange={v => setForm({ ...form, description: v })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Tarih" value={form.date || ''} onChange={v => setForm({ ...form, date: v })} />
              <Input label="Saat" value={form.time || ''} onChange={v => setForm({ ...form, time: v })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Lokasyon" value={form.location || ''} onChange={v => setForm({ ...form, location: v })} />
              <Select label="Tur" value={form.type || 'tournament'} onChange={v => setForm({ ...form, type: v })} options={['tournament', 'meetup', 'charity', 'special']} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Odul (opsiyonel)" value={form.prize || ''} onChange={v => setForm({ ...form, prize: v })} />
              <Input label="Max Katilimci" value={String(form.maxParticipants || '')} onChange={v => setForm({ ...form, maxParticipants: parseInt(v) || 0 })} type="number" />
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={save} className="flex-1 bg-xena-primary text-white py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1"><Save size={14} /> Kaydet</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-xena-muted text-sm font-bold"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3">
            <Toggle active={item.active} onToggle={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{item.title}</div>
              <div className="text-[10px] text-xena-muted">{item.date}  {item.time}  {item.location}</div>
            </div>
            {item.prize && <span className="text-[10px] font-bold text-xena-gold bg-xena-gold/10 px-2 py-0.5 rounded">{item.prize}</span>}
            <button onClick={() => setupForm(item)} className="text-xena-primary/60 hover:text-xena-primary p-1"><Edit3 size={14} /></button>
            <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xena-danger/60 hover:text-xena-danger p-1"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}


function BannerManager() {
  const [items, setItems] = useState<BannerItem[]>(() => get(S.banners, defaultBanners));
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<BannerItem>>({});
  useEffect(() => { try { set(S.banners, items); } catch (e) { console.warn("Banner kayit hatasi", e); } }, [items]);
  const setup = (item?: BannerItem) => { setEditing(item?.id || 'new'); setForm(item ? { ...item } : { tag: 'XENAHUB', title: '', subtitle: '', initial: 'X', gradientStart: '#1a0a3a', gradientMid: '#9147ff', gradientEnd: '#050509', active: true }); };
  const uploadImage = (file?: File) => { if (!file) return; const r = new FileReader(); r.onload = () => setForm(prev => ({ ...prev, image: String(r.result) })); r.readAsDataURL(file); };
  const save = () => {
    try {
      if (!form.title?.trim()) return;
      const clean: BannerItem = {
        id: editing === 'new' ? Date.now().toString() : String(form.id || editing),
        tag: form.tag || 'XENAHUB',
        title: form.title || '',
        subtitle: form.subtitle || '',
        initial: (form.initial || 'X').slice(0, 2),
        gradientStart: form.gradientStart || '#1a0a3a',
        gradientMid: form.gradientMid || '#9147ff',
        gradientEnd: form.gradientEnd || '#050509',
        active: form.active !== false,
        image: form.image,
      };
      if (editing === 'new') setItems(prev => [...prev, clean]);
      else setItems(prev => prev.map(i => i.id === editing ? clean : i));
      setEditing(null);
    } catch (e) { console.error('Banner save error', e); alert('Banner kaydedilemedi. Resim cok buyuk olabilir.'); }
  };
  return <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider">Banner Yonetimi</h3><button onClick={() => setup()} className="bg-xena-primary/15 text-xena-primary px-3 py-1.5 rounded-lg text-xs font-bold">Yeni</button></div>{editing && <div className="glass rounded-2xl p-4 border border-xena-primary/20"><Input label="Tag" value={form.tag || ''} onChange={v => setForm({ ...form, tag: v })} /><Input label="Baslik" value={form.title || ''} onChange={v => setForm({ ...form, title: v })} /><Input label="Alt Baslik" value={form.subtitle || ''} onChange={v => setForm({ ...form, subtitle: v })} /><Input label="Harf" value={form.initial || ''} onChange={v => setForm({ ...form, initial: v })} /><label className="block bg-xena-primary/15 text-xena-primary text-xs font-bold px-3 py-2 rounded-xl mb-3 cursor-pointer">Banner Resmi Ekle<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} /></label>{form.image && <img src={form.image} className="w-full h-28 object-cover rounded-xl mb-3" />}<div className="grid grid-cols-3 gap-2"><Input label="Renk 1" value={form.gradientStart || ''} onChange={v => setForm({ ...form, gradientStart: v })} /><Input label="Renk 2" value={form.gradientMid || ''} onChange={v => setForm({ ...form, gradientMid: v })} /><Input label="Renk 3" value={form.gradientEnd || ''} onChange={v => setForm({ ...form, gradientEnd: v })} /></div><button onClick={save} className="w-full bg-xena-primary text-white py-2.5 rounded-xl font-bold text-sm mt-2">Kaydet</button></div>}{items.map(item => <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3"><Toggle active={item.active} onToggle={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))} />{item.image && <img src={item.image} className="w-12 h-10 object-cover rounded-lg" />}<div className="flex-1"><div className="text-sm font-bold">{item.title}</div><div className="text-[10px] text-xena-muted">{item.tag}</div></div><button onClick={() => setup(item)} className="text-xena-primary p-1"><Edit3 size={14} /></button><button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xena-danger p-1"><Trash2 size={14} /></button></div>)}</div>;
}
function StreamerManager() {
  const [items, setItems] = useState<StreamerItem[]>(() => { try { return get(S.streamers, defaultStreamers); } catch { return defaultStreamers; } });
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<StreamerItem>>({});
  useEffect(() => { try { set(S.streamers, items); } catch (e) { console.warn("Streamer kayit hatasi", e); } }, [items]);
  const setup = (item?: StreamerItem) => { setEditing(item?.id || 'new'); setForm(item ? { ...item } : { name: '', realName: '', game: '', description: '', badgeLabel: 'VIP', active: true }); };
  const uploadImage = (file?: File) => { if (!file) return; const r = new FileReader(); r.onload = () => setForm(prev => ({ ...prev, image: String(r.result) })); r.readAsDataURL(file); };
  const save = () => { 
    try {
      if (!form.name?.trim()) return; 
      const clean: StreamerItem = {
        id: editing === 'new' ? Date.now().toString() : String(form.id || editing),
        name: form.name || '',
        realName: form.realName || '',
        game: form.game || '',
        description: form.description || '',
        badgeLabel: form.badgeLabel || 'VIP',
        active: form.active !== false,
        image: form.image,
      };
      if (editing === 'new') setItems(prev => [...prev, clean]);
      else setItems(prev => prev.map(i => i.id === editing ? clean : i));
      setEditing(null);
    } catch (e) { console.error('Streamer save error', e); alert('Yayinci kaydedilemedi.'); }
  };
  return <div className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider">One Cikan Yayinci Yonetimi</h3><button onClick={() => setup()} className="bg-xena-primary/15 text-xena-primary px-3 py-1.5 rounded-lg text-xs font-bold">Yeni</button></div>{editing && <div className="glass rounded-2xl p-4 border border-xena-primary/20"><Input label="Yayinci Adi" value={form.name || ''} onChange={v => setForm({ ...form, name: v })} /><Input label="Gercek Ad / Marka" value={form.realName || ''} onChange={v => setForm({ ...form, realName: v })} /><Input label="Kategori/Oyun" value={form.game || ''} onChange={v => setForm({ ...form, game: v })} /><Input label="Aciklama" value={form.description || ''} onChange={v => setForm({ ...form, description: v })} /><Input label="Rozet" value={form.badgeLabel || ''} onChange={v => setForm({ ...form, badgeLabel: v })} /><label className="block bg-xena-primary/15 text-xena-primary text-xs font-bold px-3 py-2 rounded-xl mb-3 cursor-pointer">Yayinci Resmi Ekle<input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} /></label>{form.image && <img src={form.image} className="w-full h-28 object-cover rounded-xl mb-3" />}<button onClick={save} className="w-full bg-xena-primary text-white py-2.5 rounded-xl font-bold text-sm mt-2">Kaydet</button></div>}{items.map(item => <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3"><Toggle active={item.active} onToggle={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))} />{item.image && <img src={item.image} className="w-12 h-10 object-cover rounded-lg" />}<div className="flex-1"><div className="text-sm font-bold">{item.name}</div><div className="text-[10px] text-xena-muted">{item.game}</div></div><button onClick={() => setup(item)} className="text-xena-primary p-1"><Edit3 size={14} /></button><button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xena-danger p-1"><Trash2 size={14} /></button></div>)}</div>;
}
function MarketManager() {
  const [items, setItems] = useState<MarketItem[]>(() => get(S.market, defaultMarket));
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MarketItem>>({});

  useEffect(() => { set(S.market, items); }, [items]);

  const setupForm = (item?: MarketItem) => {
    setEditing(item?.id || 'new');
    setForm(item ? { ...item } : { name: '', description: '', price: 0, category: 'paket', active: true, color: '#9147ff' });
  };

  const save = () => {
    if (!form.name?.trim()) return;
    if (editing === 'new') {
      setItems(prev => [...prev, { ...(form as MarketItem), id: Date.now().toString() }]);
    } else {
      setItems(prev => prev.map(i => i.id === editing ? { ...i, ...form } as MarketItem : i));
    }
    setEditing(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider">Urunleri Yonet</h3>
        <button onClick={() => setupForm()} className="flex items-center gap-1 bg-xena-primary/15 text-xena-primary px-3 py-1.5 rounded-lg text-xs font-bold active:scale-95"><Plus size={14} /> Yeni</button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-4 border border-xena-primary/20 mb-4">
            <h4 className="font-bold text-sm mb-3">{editing === 'new' ? 'Yeni Urun' : 'Urunu Duzenle'}</h4>
            <Input label="Urun Adi" value={form.name || ''} onChange={v => setForm({ ...form, name: v })} />
            <Input label="Aciklama" value={form.description || ''} onChange={v => setForm({ ...form, description: v })} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Fiyat (Altin)" value={String(form.price || 0)} onChange={v => setForm({ ...form, price: parseInt(v) || 0 })} type="number" />
              <Select label="Kategori" value={form.category || 'paket'} onChange={v => setForm({ ...form, category: v })} options={['paket', 'emote', 'avatar', 'rozet', 'efekt', 'uyelik']} />
            </div>
            <Input label="Renk (hex)" value={form.color || ''} onChange={v => setForm({ ...form, color: v })} placeholder="#9147ff" />
            <div className="flex gap-2 mt-3">
              <button onClick={save} className="flex-1 bg-xena-primary text-white py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-1"><Save size={14} /> Kaydet</button>
              <button onClick={() => setEditing(null)} className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-xena-muted text-sm font-bold"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 glass rounded-xl p-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${item.color}25` }}>
              <ShoppingBag size={14} style={{ color: item.color }} />
            </div>
            <Toggle active={item.active} onToggle={() => setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i))} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{item.name}</div>
              <div className="text-[10px] text-xena-muted">{item.price} Altin  {item.category}</div>
            </div>
            {item.hot && <span className="text-[10px] font-bold bg-xena-danger/15 text-xena-danger px-1.5 py-0.5 rounded">POPULER</span>}
            <button onClick={() => setupForm(item)} className="text-xena-primary/60 hover:text-xena-primary p-1"><Edit3 size={14} /></button>
            <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xena-danger/60 hover:text-xena-danger p-1"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== AdminPage ========== */
export default function AdminPage() {
  const { currentUser, isAdmin, isMod } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'users'>('overview');

  if (!isMod && !isAdmin) {
    return (
      <div className="min-h-dvh bg-xena-bg flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-8 text-center max-w-sm">
          <AlertTriangle size={48} className="text-xena-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erisim Reddedildi</h2>
          <p className="text-sm text-xena-muted mb-6">Bu sayfaya erisim yetkiniz yok.</p>
          <button onClick={() => navigate(-1)} className="bg-xena-primary text-white font-bold px-6 py-3 rounded-2xl active:scale-95 transition-all">Geri Don</button>
        </motion.div>
      </div>
    );
  }

  const ticker = get(S.ticker, defaultTicker);
  const news = get(S.news, defaultNews);
  const events = get(S.events, defaultEvents);
  const market = get(S.market, defaultMarket);

  const overviewStats = [
    { label: 'Kayan Duyuru', value: ticker.filter(t => t.active).length, total: ticker.length, icon: Megaphone, color: '#9147ff' },
    { label: 'Haber', value: news.filter(n => n.active).length, total: news.length, icon: Newspaper, color: '#40a9ff' },
    { label: 'Etkinlik', value: events.filter(e => e.active).length, total: events.length, icon: Calendar, color: '#FFD700' },
    { label: 'Urun', value: market.filter(m => m.active).length, total: market.length, icon: ShoppingBag, color: '#5cff7f' },
  ];

  return (
    <div className="min-h-dvh bg-xena-bg text-white pb-6">
      {/* Header */}
      <div className="px-4 py-4 safe-top flex items-center gap-3 border-b border-white/[0.06]">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => navigate(-1)} className="w-10 h-10 rounded-2xl bg-white/[0.06] flex items-center justify-center">
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-lg font-black flex items-center gap-2">
            <Shield size={18} className="text-xena-primary" />
            Admin Panel
          </h1>
          <p className="text-xs text-xena-muted">{currentUser?.username}  {currentUser?.role}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 flex gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview' as const, label: 'Genel Bakis', icon: TrendingUp },
          { id: 'content' as const, label: 'Icerik Yonetimi', icon: Edit3 },
          { id: 'users' as const, label: 'Kullanicilar', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${isActive ? 'bg-xena-primary text-white shadow-neon' : 'bg-white/[0.04] text-xena-muted hover:text-white'}`}
            >
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 mt-6">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {overviewStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="glass rounded-2xl p-4 border border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                        <Icon size={16} style={{ color: stat.color }} />
                      </div>
                    </div>
                    <div className="text-2xl font-black">{stat.value}<span className="text-sm text-xena-muted font-normal">/{stat.total}</span></div>
                    <div className="text-xs text-xena-muted">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            <Card>
              <h3 className="text-sm font-bold mb-3">Hizli Erisim</h3>
              <div className="space-y-2">
                {[
                  { icon: Megaphone, label: 'Kayan Duyurulari Duzenle', action: () => setActiveTab('content') },
                  { icon: Newspaper, label: 'Haberleri Duzenle', action: () => setActiveTab('content') },
                  { icon: Calendar, label: 'Etkinlikleri Duzenle', action: () => setActiveTab('content') },
                  { icon: ShoppingBag, label: 'Market Urunlerini Duzenle', action: () => setActiveTab('content') },
                ].map((item, i) => (
                  <button key={i} onClick={item.action} className="flex items-center gap-3 w-full glass rounded-xl p-3 hover:bg-white/[0.05] transition-all active:scale-[0.98] text-left">
                    <div className="w-9 h-9 rounded-xl bg-xena-primary/15 flex items-center justify-center">
                      <item.icon size={16} className="text-xena-primary" />
                    </div>
                    <span className="text-sm font-semibold">{item.label}</span>
                    <ChevronRight size={14} className="text-xena-muted ml-auto" />
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <TickerManager />`r`n            <div className="border-t border-white/[0.06] pt-4" />`r`n            <BannerManager />`r`n            <div className="border-t border-white/[0.06] pt-4" />`r`n            <StreamerManager />
            <div className="border-t border-white/[0.06] pt-4" />
            <NewsManager />
            <div className="border-t border-white/[0.06] pt-4" />
            <EventManager />
            <div className="border-t border-white/[0.06] pt-4" />
            <MarketManager />
            <div className='border-t border-white/[0.06] pt-4' />
            <PWAManager />
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Card>
              <ChatSettings />
            </Card>
            <div className='border-t border-white/[0.06] pt-4' />
            <Card>
              <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider mb-3">Sistem Kullanicilari</h3>
              <div className="space-y-2">
                {[
                  { username: 'Admin', role: 'admin', status: 'active', messages: 9999 },
                  { username: 'Moderator', role: 'moderator', status: 'active', messages: 543 },
                  { username: 'KralGamer_TR', role: 'user', status: 'active', messages: 1243 },
                  { username: 'ZeynepPlay', role: 'moderator', status: 'active', messages: 892 },
                  { username: 'ToxicPlayer99', role: 'user', status: 'banned', messages: 23 },
                ].map((u, i) => (
                  <div key={i} className="flex items-center gap-3 glass rounded-xl p-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-xena-primary/20 to-xena-accent/10 flex items-center justify-center text-xs font-bold">
                      {u.username[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{u.username}</span>
                        {u.role === 'admin' && <span className="text-[10px] bg-xena-danger/15 text-xena-danger px-1.5 py-0.5 rounded font-bold">ADMIN</span>}
                        {u.role === 'moderator' && <span className="text-[10px] bg-yellow-400/15 text-yellow-400 px-1.5 py-0.5 rounded font-bold">MOD</span>}
                      </div>
                      <div className="text-[10px] text-xena-muted">{u.messages} mesaj</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      u.status === 'active' ? 'bg-xena-success/15 text-xena-success' : 'bg-xena-danger/15 text-xena-danger'
                    }`}>{u.status.toUpperCase()}</span>
                    <button className="text-xena-danger/50 hover:text-xena-danger p-1"><Ban size={14} /></button>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ChatSettings() {
  const { 
    welcomeMessage, setWelcomeMessage, clearChat,
    systemUsers, addSystemUser, removeSystemUser, sendAsSystemUser,
    botMessages, addBotMessage, removeBotMessage, toggleBotMessage
  } = useChat();
  const [text, setText] = useState(welcomeMessage);
  const [saved, setSaved] = useState(false);
  
  // System User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('bot');
  const [newUserColor, setNewUserColor] = useState('#9147ff');
  const [selectedUser, setSelectedUser] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  
  // Bot Message State
  const [newBotText, setNewBotText] = useState('');
  const [newBotDelay, setNewBotDelay] = useState(60);
  
  const handleSave = () => {
    if (!text.trim()) return;
    setWelcomeMessage(text.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  
  const handleAddUser = () => {
    if (!newUserName.trim()) return;
    addSystemUser({ name: newUserName, role: newUserRole, color: newUserColor });
    setNewUserName('');
  };
  
  const handleSendAsSystem = () => {
    if (!selectedUser || !systemMessage.trim()) return;
    sendAsSystemUser(selectedUser, systemMessage);
    setSystemMessage('');
    alert('Mesaj gonderildi!');
  };
  
  const handleAddBotMessage = () => {
    if (!newBotText.trim()) return;
    addBotMessage({ text: newBotText, delay: newBotDelay, enabled: true });
    setNewBotText('');
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider">Sohbet Yonetimi</h3>
      
      {/* Hosgeldin Mesaji */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-white">Hosgeldin Mesaji</label>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Sohbet odasina hos geldiniz!"
          className="w-full bg-xena-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
        />
        <button 
          onClick={handleSave} 
          className="w-full bg-xena-primary text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <Save size={14} /> {saved ? 'Kaydedildi!' : 'Kaydet'}
        </button>
      </div>
      
      <div className="border-t border-white/[0.06] pt-4">
        <h4 className="text-xs font-bold text-white mb-3">Sistem Kullanicilari</h4>
        
        {/* Mevcut Sistem Kullanicilari */}
        <div className="space-y-2 mb-3">
          {systemUsers.map(u => (
            <div key={u.id} className="flex items-center gap-2 glass rounded-lg p-2">
              <div className="w-3 h-3 rounded-full" style={{ background: u.color }} />
              <span className="text-sm font-bold flex-1">{u.name}</span>
              <span className="text-[10px] text-xena-muted">{u.role}</span>
              <button onClick={() => removeSystemUser(u.id)} className="text-xena-danger p-1"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        
        {/* Yeni Sistem Kullanicisi Ekle */}
        <div className="space-y-2">
          <input 
            type="text" 
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Bot adi (ornek: TurnuvaBot)"
            className="w-full bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
          />
          <div className="flex gap-2">
            <select 
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-xena-primary"
            >
              <option value="bot">Bot</option>
              <option value="system">Sistem</option>
            </select>
            <input 
              type="color" 
              value={newUserColor}
              onChange={(e) => setNewUserColor(e.target.value)}
              className="w-12 h-10 rounded-xl bg-transparent border border-white/10"
            />
            <button 
              onClick={handleAddUser}
              className="flex-1 bg-xena-primary/20 text-xena-primary py-2 rounded-xl font-bold text-sm"
            >
              <Plus size={14} className="inline" /> Ekle
            </button>
          </div>
        </div>
        
        {/* Sistem Kullanicisi ile Mesaj Gonder */}
        <div className="space-y-2 mt-3 pt-3 border-t border-white/[0.06]">
          <select 
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-xena-primary"
          >
            <option value="">Kullanici sec...</option>
            {systemUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <input 
            type="text" 
            value={systemMessage}
            onChange={(e) => setSystemMessage(e.target.value)}
            placeholder="Mesaj yaz..."
            className="w-full bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
          />
          <button 
            onClick={handleSendAsSystem}
            disabled={!selectedUser || !systemMessage.trim()}
            className="w-full bg-xena-primary text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send size={14} /> Gonder
          </button>
        </div>
      </div>
      
      <div className="border-t border-white/[0.06] pt-4">
        <h4 className="text-xs font-bold text-white mb-3">Otomatik Bot Mesajlari</h4>
        
        {/* Mevcut Bot Mesajlari */}
        <div className="space-y-2 mb-3">
          {botMessages.map(m => (
            <div key={m.id} className="flex items-center gap-2 glass rounded-lg p-2">
              <button 
                onClick={() => toggleBotMessage(m.id)}
                className={`w-8 h-5 rounded-full relative transition-colors ${m.enabled ? 'bg-xena-primary' : 'bg-xena-surface'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${m.enabled ? 'left-3.5' : 'left-0.5'}`} />
              </button>
              <span className={`text-sm flex-1 truncate ${m.enabled ? 'text-white' : 'text-xena-muted'}`}>{m.text}</span>
              <span className="text-[10px] text-xena-muted">{m.delay}dk</span>
              <button onClick={() => removeBotMessage(m.id)} className="text-xena-danger p-1"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
        
        {/* Yeni Bot Mesaji Ekle */}
        <div className="space-y-2">
          <input 
            type="text" 
            value={newBotText}
            onChange={(e) => setNewBotText(e.target.value)}
            placeholder="Bot mesaji..."
            className="w-full bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
          />
          <div className="flex gap-2">
            <input 
              type="number" 
              value={newBotDelay}
              onChange={(e) => setNewBotDelay(parseInt(e.target.value) || 60)}
              placeholder="Dakika"
              className="w-24 bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-xena-primary"
            />
            <button 
              onClick={handleAddBotMessage}
              className="flex-1 bg-xena-primary/20 text-xena-primary py-2 rounded-xl font-bold text-sm"
            >
              <Plus size={14} className="inline" /> Ekle
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/[0.06] pt-4">
        <button 
          onClick={() => { if (confirm('Sohbet tamamen temizlensin mi?')) clearChat(); }} 
          className="w-full bg-xena-danger/15 text-xena-danger border border-xena-danger/30 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <Trash2 size={14} /> Tum Sohbeti Temizle
        </button>
      </div>
    </div>
  );
}
