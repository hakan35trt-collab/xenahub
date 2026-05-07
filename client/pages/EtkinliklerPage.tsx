import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import TopBar from '../components/TopBar';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';

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
  { id: '1', title: 'Valorant Turkiye Turnuvasi', description: 'Aylik Valorant turnuvamiz basliyor! 5 kisilik takimlar halinde katilin. En iyi takimlar odul kazanacak.', date: '18 Mayis 2026', time: '20:00', location: 'Online', type: 'tournament', prize: '5.000 TL', participants: 128, maxParticipants: 256 },
  { id: '2', title: 'Istanbul Oyuncu Bulusmasi', description: 'Istanbul\'daki yayıncılarımız ve izleyicilerimizle bir araya geliyoruz. Sürpriz konuklar ve hediyeler!', date: '25 Mayis 2026', time: '14:00', location: 'Istanbul, Kadikoy', type: 'meetup', participants: 45, maxParticipants: 100 },
  { id: '3', title: 'Yardim Yayini - Deprem Bolgesi', description: 'Deprem bolgesindeki cocuklar icin 24 saatlik yardim yayini. Tum bagislar iletilecek.', date: '1 Haziran 2026', time: '12:00', location: 'Online (Twitch & YouTube)', type: 'charity', participants: 340 },
  { id: '4', title: 'CS2 Pro vs Amateur', description: 'Profesyonel oyuncular amator izleyicilere karsi! Siz de takima katilabilirsiniz.', date: '8 Haziran 2026', time: '21:00', location: 'Online', type: 'tournament', prize: '2.500 TL', participants: 64, maxParticipants: 128 },
  { id: '5', title: 'Yaz Festivali 2026', description: 'Yaz aylarinin buyuk festivali! Turnuvalar, cekilisler, surpriz konuklar ve cok daha fazlasi.', date: '15 Haziran 2026', time: '11:00', location: 'Ankara, ODTU Kultur Merkezi', type: 'special', participants: 200, maxParticipants: 500 },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  tournament: { icon: '\u{1F3C6}', color: '#FFD700', label: 'Turnuva' },
  meetup: { icon: '\u{1F465}', color: '#00b3ff', label: 'Bulusma' },
  charity: { icon: '\u{2764}\u{FE0F}', color: '#ff6b6b', label: 'Yardim' },
  special: { icon: '\u{2B50}', color: '#9147ff', label: 'Ozel' },
};

const FILTERS = ['Tumu', 'Turnuva', 'Bulusma', 'Yardim', 'Ozel'];
const STORAGE_KEY = 'xenahub_registered_events';

export default function EtkinliklerPage() {
  const [activeFilter, setActiveFilter] = useState('Tumu');
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const { isLoggedIn } = useAuth();
  const { events: adminEvents } = useContent();
  const visibleEvents = adminEvents.filter((e: any) => e.active);
  const [eventParticipants, setEventParticipants] = useState<Record<string, number>>(() =>
    Object.fromEntries((adminEvents.length ? adminEvents : EVENTS).map((e: any) => [e.id, e.participants]))
  );

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRegisteredIds(new Set(parsed.registeredIds || []));
        if (parsed.participants) setEventParticipants(parsed.participants);
      }
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  const persist = (ids: Set<string>, parts: Record<string, number>) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ registeredIds: Array.from(ids), participants: parts }));
    setRegisteredIds(ids);
    setEventParticipants(parts);
  };

  const toggleRegister = (id: string) => {
    if (!isLoggedIn) {
      alert('Katilmak icin giris yapmalisiniz.');
      return;
    }
    const event = visibleEvents.find((e: any) => e.id === id);
    if (!event) return;

    const nextIds = new Set(registeredIds);
    const nextParts = { ...eventParticipants };

    if (nextIds.has(id)) {
      nextIds.delete(id);
      nextParts[id] = Math.max(0, (nextParts[id] ?? event.participants) - 1);
    } else {
      if (event.maxParticipants && (nextParts[id] ?? 0) >= event.maxParticipants) {
        alert('Bu etkinlik dolu!');
        return;
      }
      nextIds.add(id);
      nextParts[id] = (nextParts[id] ?? event.participants) + 1;
    }

    persist(nextIds, nextParts);
  };

  const filtered = visibleEvents.filter((e: any) => {
    if (activeFilter === 'Tumu') return true;
    return TYPE_CONFIG[e.type]?.label === activeFilter;
  });

  return (
    <div className="min-h-dvh bg-xena-bg pb-20">
      <TopBar />
      <div className="px-4 pt-3 pb-2 safe-top">
        <h1 className="text-2xl font-extrabold text-white">Etkinlikler</h1>
        <p className="text-[13px] text-xena-muted mt-0.5">{visibleEvents.length} yaklasan etkinlik</p>
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
          const currentCount = eventParticipants[item.id] ?? item.participants;
          const percentage = item.maxParticipants ? Math.min((currentCount / item.maxParticipants) * 100, 100) : null;
          const isFull = item.maxParticipants ? currentCount >= item.maxParticipants : false;
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
                    <span className="text-xena-muted">{currentCount}/{item.maxParticipants} katilimci</span>
                    <span className="font-bold text-xena-accent">%{Math.round(percentage)}</span>
                  </div>
                  <div className="h-1 bg-xena-surface rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, background: percentage > 80 ? '#ff4444' : '#9147ff' }} />
                  </div>
                </div>
              )}
              <button onClick={() => toggleRegister(item.id)} disabled={isFull && !isRegistered} className={`w-full py-3 rounded-xl text-[15px] font-bold transition-all active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed ${isRegistered ? 'bg-xena-success/15 text-xena-success border border-xena-success/30' : isFull ? 'bg-xena-danger/15 text-xena-danger border border-xena-danger/30' : 'btn-primary'}`}>
                {isRegistered ? '\u{2713} Katildin' : isFull ? 'Dolu' : 'Katil'}
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


