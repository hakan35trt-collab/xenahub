import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Users, MessageSquare, Ticket, TrendingUp, Ban,
  Crown, Star, CheckCircle, XCircle, Plus, Trash2, Edit3, Save, X,
  Megaphone, ShoppingBag, Newspaper, Calendar, AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ========== Shared Types ========== */
interface TickerItem { id: string; text: string; active: boolean; }
interface NewsItem { id: string; title: string; summary: string; content: string; date: string; category: string; active: boolean; }
interface EventItem { id: string; title: string; description: string; date: string; time: string; location: string; type: string; prize?: string; participants: number; maxParticipants?: number; active: boolean; }
interface MarketItem { id: string; name: string; description: string; price: number; category: string; active: boolean; hot?: boolean; color: string; }

/* ========== Storage Helpers ========== */
const get = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const set = <T,>(key: string, data: T) => localStorage.setItem(key, JSON.stringify(data));

const S = {
  ticker: 'xenahub_admin_ticker',
  news: 'xenahub_admin_news',
  events: 'xenahub_admin_events',
  market: 'xenahub_admin_market',
  users: 'xenahub_admin_users',
};

const defaultTicker: TickerItem[] = [
  { id: 't1', text: '\u{1F3C6} XENAHUB Mayis Turnuvasi kayitlari basladi!', active: true },
  { id: 't2', text: '\u{26A1} KralGamer_TR bu aksam 21:00\'de canlida!', active: true },
  { id: 't3', text: '\u{1F381} 5000 TL odullu Valorant turnuvasi', active: true },
];

const defaultNews: NewsItem[] = [
  { id: 'n1', title: 'XENAHUB Mayis Destek Programi Basladi', summary: 'Yeni yayıncilara ozel mentorluk ve ekipman destegi.', content: 'Bu ay baslattigimiz yeni destek programiyla 100 yeni yayınciya mentorluk, ekipman ve reklam destegi saglayacagiz.', date: '6 Mayis 2026', category: 'platform', active: true },
  { id: 'n2', title: 'Valorant Episode 9 Guncellemesi', summary: 'Yeni harita, yeni ajan ve buyuk meta degisiklikleri.', content: 'Valorant\'in en buyuk guncellemelerinden biri olan Episode 9 ile birlikte Pearl haritasi yenilendi.', date: '5 Mayis 2026', category: 'gaming', active: true },
];

const defaultEvents: EventItem[] = [
  { id: 'e1', title: 'Valorant Turkiye Turnuvasi', description: 'Aylik Valorant turnuvamiz basliyor!', date: '18 Mayis 2026', time: '20:00', location: 'Online', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256, active: true },
  { id: 'e2', title: 'Istanbul Oyuncu Bulusmasi', description: 'Sürpriz konuklar ve hediyeler!', date: '25 Mayis 2026', time: '14:00', location: 'Istanbul, Kadikoy', type: 'meetup', participants: 45, maxParticipants: 100, active: true },
];

const defaultMarket: MarketItem[] = [
  { id: 'm1', name: 'Baslangic Paketi', description: '100 Coins', price: 300, category: 'paket', active: true, hot: true, color: '#5cff7f' },
  { id: 'm2', name: 'Orta Paket', description: '250 Coins', price: 700, category: 'paket', active: true, color: '#40a9ff' },
  { id: 'm3', name: 'VIP Uyelik 7 Gun', description: '7 gunluk VIP ayricaliklari', price: 800, category: 'uyelik', active: true, limited: true, color: '#00b3ff' },
];

/* ========== Reusable Components ========== */
function Input({ label, value, onChange, type = 'text', placeholder = '' }: any) {
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

function Select({ label, value, onChange, options }: any) {
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
              <div className="text-[10px] text-xena-muted">{item.date} · {item.category}</div>
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
              <div className="text-[10px] text-xena-muted">{item.date} · {item.time} · {item.location}</div>
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
              <div className="text-[10px] text-xena-muted">{item.price} Altin · {item.category}</div>
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
          <p className="text-xs text-xena-muted">{currentUser?.username} — {currentUser?.role}</p>
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
            <TickerManager />
            <div className="border-t border-white/[0.06] pt-4" />
            <NewsManager />
            <div className="border-t border-white/[0.06] pt-4" />
            <EventManager />
            <div className="border-t border-white/[0.06] pt-4" />
            <MarketManager />
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
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
