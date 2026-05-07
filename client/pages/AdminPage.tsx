import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Users, MessageSquare, Ticket, TrendingUp, Ban, Crown, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MockUser {
  id: string;
  username: string;
  role: string;
  status: 'active' | 'banned' | 'warning';
  joinDate: string;
  messages: number;
}

const mockUsers: MockUser[] = [
  { id: 'u1', username: 'KralGamer_TR', role: 'user', status: 'active', joinDate: '2026-04-01', messages: 1243 },
  { id: 'u2', username: 'ZeynepPlay', role: 'moderator', status: 'active', joinDate: '2026-03-15', messages: 892 },
  { id: 'u3', username: 'CanGamer', role: 'user', status: 'warning', joinDate: '2026-04-20', messages: 345 },
  { id: 'u4', username: 'ElifPlay', role: 'user', status: 'active', joinDate: '2026-05-01', messages: 156 },
  { id: 'u5', username: 'ToxicPlayer99', role: 'user', status: 'banned', joinDate: '2026-04-10', messages: 23 },
];

const mockTickets = [
  { id: 't1', title: 'Ödeme alamadım', user: 'KralGamer_TR', status: 'open', priority: 'high', date: '2026-05-07' },
  { id: 't2', title: 'Şikayet: Hakaret', user: 'ZeynepPlay', status: 'open', priority: 'medium', date: '2026-05-06' },
  { id: 't3', title: 'Turnuva sorunu', user: 'CanGamer', status: 'closed', priority: 'low', date: '2026-05-05' },
];

const mockStats = [
  { label: 'Toplam Kullanıcı', value: '2,847', change: '+12%', icon: Users },
  { label: 'Bugün Mesaj', value: '12.4K', change: '+8%', icon: MessageSquare },
  { label: 'Açık Ticket', value: '18', change: '-3', icon: Ticket },
  { label: 'Aktif Turnuva', value: '48', change: '+5', icon: TrendingUp },
];

export default function AdminPage() {
  const { currentUser, isMod } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tickets'>('overview');

  if (!isMod) {
    return (
      <div className="min-h-dvh bg-xena-bg flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-8 text-center max-w-sm">
          <AlertTriangle size={48} className="text-xena-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Erişim Reddedildi</h2>
          <p className="text-sm text-xena-muted mb-6">Bu sayfaya erişim yetkiniz yok.</p>
          <button onClick={() => navigate(-1)} className="bg-xena-primary text-white font-bold px-6 py-3 rounded-2xl active:scale-95 transition-all">Geri Dön</button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Genel Bakış', icon: TrendingUp },
    { id: 'users' as const, label: 'Kullanıcılar', icon: Users },
    { id: 'tickets' as const, label: 'Ticketlar', icon: Ticket },
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
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                isActive ? 'bg-xena-primary text-white shadow-neon' : 'bg-white/[0.04] text-xena-muted hover:text-white'
              }`}
            >
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 mt-6">
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {mockStats.map((stat, i) => {
                const Icon = stat.icon;
                const positive = stat.change.startsWith('+');
                return (
                  <div key={i} className="glass rounded-2xl p-4 border border-white/[0.04]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-xena-primary/15 flex items-center justify-center">
                        <Icon size={16} className="text-xena-primary" />
                      </div>
                      <span className={`text-xs font-bold ${positive ? 'text-xena-success' : 'text-xena-danger'}`}>{stat.change}</span>
                    </div>
                    <div className="text-2xl font-black">{stat.value}</div>
                    <div className="text-xs text-xena-muted">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <h3 className="text-sm font-bold text-xena-muted uppercase tracking-wider mb-3">Hızlı İşlemler</h3>
            <div className="space-y-2">
              {[
                { icon: Crown, label: 'Moderatör Yetkisi Ver', color: 'text-yellow-400' },
                { icon: Ban, label: 'Kullanıcı Banla', color: 'text-xena-danger' },
                { icon: Star, label: 'Öne Çıkan Duyuru Ekle', color: 'text-xena-primary' },
              ].map((action, i) => (
                <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3 border border-white/[0.04]">
                  <action.icon size={18} className={action.color} />
                  <span className="text-sm font-semibold">{action.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {mockUsers.map(user => (
              <div key={user.id} className="glass rounded-2xl p-4 flex items-center gap-3 border border-white/[0.04]">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xena-primary/20 to-xena-accent/10 flex items-center justify-center text-sm font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{user.username}</span>
                    {user.role === 'moderator' && <span className="text-[10px] bg-yellow-400/15 text-yellow-400 px-1.5 py-0.5 rounded font-bold">MOD</span>}
                  </div>
                  <div className="text-xs text-xena-muted">{user.messages} mesaj · {user.joinDate}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  user.status === 'active' ? 'bg-xena-success/15 text-xena-success' :
                  user.status === 'warning' ? 'bg-yellow-400/15 text-yellow-400' :
                  'bg-xena-danger/15 text-xena-danger'
                }`}>{user.status.toUpperCase()}</span>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {mockTickets.map(ticket => (
              <div key={ticket.id} className="glass rounded-2xl p-4 border border-white/[0.04]">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm">{ticket.title}</h4>
                    <p className="text-xs text-xena-muted mt-0.5">{ticket.user} · {ticket.date}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    ticket.status === 'open' ? 'bg-xena-primary/15 text-xena-primary' : 'bg-xena-success/15 text-xena-success'
                  }`}>{ticket.status.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                    ticket.priority === 'high' ? 'bg-xena-danger/15 text-xena-danger' :
                    ticket.priority === 'medium' ? 'bg-yellow-400/15 text-yellow-400' :
                    'bg-xena-muted/15 text-xena-muted'
                  }`}>{ticket.priority.toUpperCase()}</span>
                  {ticket.status === 'open' && (
                    <button className="text-[10px] font-bold text-xena-primary bg-xena-primary/10 px-2 py-1 rounded active:scale-95">Yanıtla</button>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
