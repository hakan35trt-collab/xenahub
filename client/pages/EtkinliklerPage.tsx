import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy, Heart, ChevronRight } from 'lucide-react';
import TopBar from '../components/TopBar';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'tournament' | 'meetup' | 'charity' | 'special';
  prize?: string;
  participants: number;
  maxParticipants?: number;
}

const EVENTS: Event[] = [
  { id: '1', title: 'Valorant Türkiye Turnuvası', description: 'Aylık Valorant turnuvamız başlıyor! 5\'er kişilik takımlar halinde katılın. En iyi takımlar ödül kazanacak.', date: '18 Mayıs 2026', time: '20:00', location: 'Online', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256 },
  { id: '2', title: 'İstanbul Oyuncu Buluşması', description: 'İstanbul\'daki yayıncılarımız ve izleyicilerimizle bir araya geliyoruz. Sürpriz konuklar ve hediyeler!', date: '25 Mayıs 2026', time: '14:00', location: 'İstanbul, Kadıköy', type: 'meetup', participants: 45, maxParticipants: 100 },
  { id: '3', title: 'Yardım Yayını - Deprem Bölgesi', description: 'Deprem bölgesindeki çocuklar için 24 saatlik yardım yayını. Tüm bağışlar iletilecek.', date: '1 Haziran 2026', time: '12:00', location: 'Online (Twitch & YouTube)', type: 'charity', participants: 340 },
  { id: '4', title: 'CS2 Pro vs Amateur', description: 'Profesyonel oyuncular amatör izleyicilere karşı! Siz de takıma katılabilirsiniz.', date: '8 Haziran 2026', time: '21:00', location: 'Online', type: 'tournament', prize: '2.500 TL', participants: 64, maxParticipants: 128 },
  { id: '5', title: 'Yaz Festivali 2026', description: 'Yaz aylarının büyük festivali! Turnuvalar, çekilişler, sürpriz konuklar ve çok daha fazlası.', date: '15 Haziran 2026', time: '11:00', location: 'Ankara, ODTÜ Kültür Merkezi', type: 'special', participants: 200, maxParticipants: 500 },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  tournament: { icon: '🏆', color: '#FFD700', label: 'Turnuva' },
  meetup: { icon: '👥', color: '#00b3ff', label: 'Buluşma' },
  charity: { icon: '❤️', color: '#ff6b6b', label: 'Yardım' },
  special: { icon: '⭐', color: '#9147ff', label: 'Özel' },
};

const FILTERS = ['Tümü', 'Turnuva', 'Buluşma', 'Yardım', 'Özel'];

export default function EtkinliklerPage() {
  const [activeFilter, setActiveFilter] = useState('Tümü');
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  const filtered = EVENTS.filter((e) => {
    if (activeFilter === 'Tümü') return true;
    return TYPE_CONFIG[e.type].label === activeFilter;
  });

  const toggleRegister = (id: string) => {
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-dvh bg-xena-bg pb-20">
      <TopBar />
      <div className="px-4 pt-3 pb-2 safe-top">
        <h1 className="text-2xl font-extrabold text-white">Etkinlikler</h1>
        <p className="text-[13px] text-xena-muted mt-0.5">{EVENTS.length} yaklaşan etkinlik</p>
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
        {filtered.map((item, i) => {
          const config = TYPE_CONFIG[item.type];
          const isRegistered = registeredIds.has(item.id);
          const percentage = item.maxParticipants ? Math.min((item.participants / item.maxParticipants) * 100, 100) : null;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold px-2 py-1 rounded-full border flex items-center gap-1" style={{ background: `${config.color}18`, borderColor: `${config.color}35`, color: config.color }}>
                  {config.icon} {config.label}
                </span>
                {item.prize && <span className="text-[11px] font-bold text-xena-gold bg-xena-gold/10 px-2 py-1 rounded-full">{item.prize}</span>}
              </div>
              <h3 className="text-base font-bold text-white">{item.title}</h3>
              <p className="text-[13px] text-xena-muted line-clamp-2 mt-1 mb-3">{item.description}</p>
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-xena-muted"><Calendar size={11} className="text-xena-accent" /> {item.date}</div>
                <div className="flex items-center gap-1.5 text-xs text-xena-muted"><Clock size={11} className="text-xena-accent" /> {item.time}</div>
                <div className="flex items-center gap-1.5 text-xs text-xena-muted"><MapPin size={11} className="text-xena-accent" /> {item.location}</div>
              </div>
              {percentage !== null && (
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-xena-muted">{item.participants}/{item.maxParticipants} katılımcı</span>
                    <span className="font-bold text-xena-accent">%{Math.round(percentage)}</span>
                  </div>
                  <div className="h-1 bg-xena-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, background: percentage > 80 ? '#ff4444' : '#9147ff' }} />
                  </div>
                </div>
              )}
              <button onClick={() => toggleRegister(item.id)} className={`w-full py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.96] ${isRegistered ? 'bg-xena-surface text-xena-muted border border-white/10' : 'btn-primary'}`}>
                {isRegistered ? '✓ Katıldın' : 'Katıl'}
              </button>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Calendar size={40} className="text-xena-muted mx-auto mb-3" />
            <p className="text-xena-muted">Bu kategoride etkinlik yok</p>
          </div>
        )}
      </div>
    </div>
  );
}
