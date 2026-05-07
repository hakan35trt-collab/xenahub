import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useContent } from '../context/ContentContext';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: string;
  readTime?: string;
  isNew?: boolean;
  likes?: number;
}

const NEWS: NewsItem[] = [
  { id: '1', title: 'XENAHUB Mayıs Destek Programı Başladı', summary: 'Yeni yayıncılara özel mentörlük ve ekipman desteği sunmaya başlıyoruz.', content: 'Bu ay başlattığımız yeni destek programıyla 100 yeni yayıncıya mentörlük, ekipman ve reklam desteği sağlayacağız. Başvurular 20 Mayıs\'a kadar açık.', date: '6 Mayıs 2026', category: 'platform', readTime: '2 dk', isNew: true, likes: 234 },
  { id: '2', title: 'Valorant Episode 9 Güncellemesi Geldi', summary: 'Yeni harita, yeni ajan ve büyük meta değişiklikleri ile Episode 9 başladı.', content: 'Valorant\'ın en büyük güncellemelerinden biri olan Episode 9 ile birlikte Pearl haritası yenilendi, yeni bir harita eklendi ve Sage\'in kiti baştan yazıldı.', date: '5 Mayıs 2026', category: 'gaming', readTime: '3 dk', isNew: true, likes: 567 },
  { id: '3', title: 'Türkiye Esports Şampiyonası Finali', summary: 'Bu hafta sonu gerçekleşecek final maçı için biletler satışa çıktı.', content: '5 yıldır düzenlediğimiz Türkiye Esports Şampiyonası\'nın bu yılki finali İstanbul Arena\'da gerçekleşecek.', date: '4 Mayıs 2026', category: 'esports', readTime: '4 dk', likes: 892 },
  { id: '4', title: 'XENAHUB v2.5 Güncellemesi Yayında', summary: 'Sohbet filtreleme, yeni bildirim sistemi ve performans iyileştirmeleri.', content: 'Bu güncellemede sohbet için gelişmiş spam filtreleme eklendi, bildirimler yeniden tasarlandı ve uygulama genelinde %30 daha hızlı yükleme süreleri elde edildi.', date: '3 Mayıs 2026', category: 'update', readTime: '2 dk', likes: 145 },
  { id: '5', title: 'GTA VI Türkiye Lansmanı Tarihi Açıklandı', summary: 'Rockstar Games, GTA VI\'nın Türkiye lansmanı için özel etkinlik planlıyor.', content: 'GTA VI\'nın resmi Türkiye lansmanı 2 Haziran 2026 tarihinde İstanbul\'da yapılacak özel bir etkinlikle kutlanacak. XENAHUB bu etkinliğin resmi yayın ortağı oldu.', date: '2 Mayıs 2026', category: 'gaming', readTime: '3 dk', likes: 1243 },
];

const CATEGORY_CONFIG: Record<string, { color: string; label: string }> = {
  platform: { color: '#9147ff', label: 'Platform' },
  gaming: { color: '#00b3ff', label: 'Oyun' },
  esports: { color: '#FFD700', label: 'Esports' },
  update: { color: '#00ad03', label: 'Güncelleme' },
};

const FILTERS = ['Tümü', 'Platform', 'Oyun', 'Esports', 'Güncelleme'];

function NewsCard({ item }: { item: NewsItem }) {
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const config = CATEGORY_CONFIG[item.category];

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${config.color}18`, color: config.color }}>{config.label}</span>
          {item.isNew && <span className="text-[9px] font-extrabold bg-xena-danger text-white px-1.5 py-0.5 rounded-md">YENİ</span>}
        </div>
        <div className="flex items-center gap-1 text-xena-muted"><Clock size={11} /> <span className="text-[11px]">{item.readTime ?? '2 dk'}</span></div>
      </div>
      <h3 className="text-[15px] font-bold text-white leading-snug mb-1.5">{item.title}</h3>
      <p className={`text-[13px] text-xena-muted leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>{expanded ? item.content : item.summary}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-[11px] text-xena-muted">{item.date}</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setLiked(!liked)} className="flex items-center gap-1">
            <Heart size={15} className={liked ? 'text-xena-danger fill-xena-danger' : 'text-xena-muted'} />
            <span className={`text-xs font-semibold ${liked ? 'text-xena-danger' : 'text-xena-muted'}`}>{(item.likes ?? 0) + (liked ? 1 : 0)}</span>
          </button>
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xena-primary">
            <span className="text-xs font-semibold">{expanded ? 'Kapat' : 'Devamı'}</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HaberlerPage() {
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const { news } = useContent();

  const filtered = news.filter((n: any) => n.active).filter((n: any) => {
    if (activeFilter === 'Tümü') return true;
    return CATEGORY_CONFIG[n.category].label === activeFilter;
  });

  return (
    <div className="min-h-dvh bg-xena-bg pb-20">
      <TopBar />
      <div className="px-4 pt-3 pb-2 safe-top">
        <h1 className="text-2xl font-extrabold text-white">Haberler</h1>
        <p className="text-[13px] text-xena-muted mt-0.5">Güncel platform ve oyun haberleri</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                activeFilter === f ? 'bg-xena-primary text-white' : 'bg-xena-surface text-xena-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 space-y-3">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <NewsCard item={item} />
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <FileText size={40} className="text-xena-muted mx-auto mb-3" />
            <p className="text-xena-muted">Bu kategoride haber yok</p>
          </div>
        )}
      </div>
    </div>
  );
}

