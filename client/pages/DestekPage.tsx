import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Send, X, Image as ImageIcon, Clock, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSupport } from '../context/SupportContext';
import TopBar from '../components/TopBar';

const CATEGORIES = [
  { value: 'teknik' as const, label: 'Teknik Sorun', icon: '🔧' },
  { value: 'hesap' as const, label: 'Hesap Sorunu', icon: '👤' },
  { value: 'odeme' as const, label: 'Ödeme/Cüzdan', icon: '💰' },
  { value: 'icerik' as const, label: 'İçerik Sorunu', icon: '📋' },
  { value: 'diger' as const, label: 'Diğer', icon: '💬' },
];

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  open: { label: 'Açık', color: '#5cff7f' },
  in_progress: { label: 'İşlemde', color: '#FFD700' },
  closed: { label: 'Kapatıldı', color: '#6b6b8a' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  const d = Math.floor(h / 24);
  return `${d} gün önce`;
}

export default function DestekPage() {
  const { currentUser, isLoggedIn } = useAuth();
  const { tickets, createTicket, replyToTicket, closeTicket, reopenTicket, markReadByUser, getUserTickets } = useSupport();
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'teknik' | 'hesap' | 'odeme' | 'icerik' | 'diger'>('teknik');
  const [newMessage, setNewMessage] = useState('');
  const [replyText, setReplyText] = useState('');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'moderator';
  const myTickets = currentUser ? (isAdmin ? tickets : getUserTickets(currentUser.id)) : [];
  const unreadCount = myTickets.filter((t) => isAdmin ? t.unreadByAdmin : t.unreadByUser).length;

  const handleCreateTicket = () => {
    if (!currentUser || !newTitle.trim() || !newMessage.trim()) return;
    const ticket = createTicket(currentUser.id, currentUser.username, newTitle.trim(), newCategory, newMessage.trim());
    setNewTitle('');
    setNewMessage('');
    setNewCategory('teknik');
    setSelectedTicket(ticket);
    setView('detail');
  };

  const openTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setView('detail');
    markReadByUser(ticket.id);
  };

  return (
    <div className="min-h-dvh bg-xena-bg pb-20">
      <TopBar />
      <div className="px-4 pt-3 pb-2 safe-top flex items-center gap-3">
        {view !== 'list' && (
          <button onClick={() => setView('list')} className="p-2 -ml-2 text-xena-primary">
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-extrabold text-white flex-1">
          {view === 'list' ? 'Destek' : view === 'create' ? 'Yeni Talep' : 'Talep Detayı'}
        </h1>
        {view === 'list' && unreadCount > 0 && (
          <span className="bg-xena-primary text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full">{unreadCount}</span>
        )}
        {view === 'list' && isLoggedIn && (
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-1 bg-xena-primary text-white text-xs font-bold px-3 py-2 rounded-full active:scale-95 transition-all"
          >
            <Plus size={14} /> Yeni Talep
          </button>
        )}
      </div>

      {!isLoggedIn ? (
        <div className="text-center py-20 px-4">
          <span className="text-5xl">🔒</span>
          <h2 className="text-lg font-bold text-white mt-4">Giriş Yapmalısın</h2>
          <p className="text-sm text-xena-muted mt-1">Destek talebi oluşturmak için giriş yapman gerekiyor.</p>
        </div>
      ) : view === 'list' ? (
        <div className="px-4 space-y-2.5">
          {myTickets.length === 0 && (
            <div className="text-center py-16">
              <span className="text-5xl">🎫</span>
              <h2 className="text-lg font-bold text-white mt-4">Henüz Talep Yok</h2>
              <button onClick={() => setView('create')} className="mt-4 btn-primary px-4 py-2 rounded-full text-sm">
                <Plus size={14} className="inline mr-1" /> Talep Oluştur
              </button>
            </div>
          )}
          {myTickets.map((ticket) => {
            const hasUnread = isAdmin ? ticket.unreadByAdmin : ticket.unreadByUser;
            const status = STATUS_INFO[ticket.status];
            const cat = CATEGORIES.find((c) => c.value === ticket.category);
            return (
              <button
                key={ticket.id}
                onClick={() => openTicket(ticket)}
                className={`w-full text-left card p-3.5 border ${hasUnread ? 'border-xena-primary/30' : 'border-white/[0.04]'}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{cat?.icon ?? '💬'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">{ticket.title}</h4>
                      {hasUnread && <div className="w-2 h-2 rounded-full bg-xena-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-xena-muted mt-0.5">{cat?.label} • {timeAgo(ticket.updatedAt)}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0" style={{ color: status.color, borderColor: `${status.color}44`, background: `${status.color}18` }}>{status.label}</span>
                </div>
                {ticket.messages.length > 0 && (
                  <p className="text-xs text-xena-muted mt-2 line-clamp-1">{ticket.messages[ticket.messages.length - 1].text}</p>
                )}
                <p className="text-[11px] text-xena-muted mt-1">{ticket.messages.length} mesaj</p>
              </button>
            );
          })}
        </div>
      ) : view === 'create' ? (
        <div className="px-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-xena-muted mb-2 block">Kategori</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setNewCategory(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border transition-all active:scale-95 ${
                    newCategory === c.value
                      ? 'bg-xena-primary/20 border-xena-primary text-xena-primary'
                      : 'bg-xena-surface border-white/10 text-xena-muted'
                  }`}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-xena-muted mb-2 block">Başlık</label>
            <input
              type="text"
              placeholder="Sorunuzu kısaca özetleyin..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={80}
              className="w-full bg-xena-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-xena-muted mb-2 block">Açıklama</label>
            <textarea
              placeholder="Sorununuzu detaylı anlatın..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={1000}
              rows={5}
              className="w-full bg-xena-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary resize-none"
            />
          </div>
          <button
            onClick={handleCreateTicket}
            disabled={!newTitle.trim() || !newMessage.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.96] ${
              newTitle.trim() && newMessage.trim() ? 'btn-primary' : 'bg-xena-surface text-xena-muted'
            }`}
          >
            <Send size={16} /> Talep Gönder
          </button>
        </div>
      ) : selectedTicket ? (
        <div className="px-4 flex flex-col min-h-[calc(100dvh-140px)]">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-3">
            <div className="flex-1">
              <h2 className="text-sm font-bold text-white">{selectedTicket.title}</h2>
              <p className="text-xs text-xena-muted">
                {CATEGORIES.find((c) => c.value === selectedTicket.category)?.label} • {timeAgo(selectedTicket.createdAt)}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: STATUS_INFO[selectedTicket.status].color, borderColor: `${STATUS_INFO[selectedTicket.status].color}44`, background: `${STATUS_INFO[selectedTicket.status].color}18` }}>
              {STATUS_INFO[selectedTicket.status].label}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-4">
            {selectedTicket.messages.map((msg: any) => {
              const isMine = msg.senderId === currentUser?.id;
              const isAdminMsg = msg.senderRole === 'admin' || msg.senderRole === 'moderator';
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl border p-3 ${isMine ? 'bg-xena-primary/20 border-xena-primary/30' : 'bg-xena-surface border-white/10'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isAdminMsg && <span className="text-xs">🛡️</span>}
                      <span className={`text-[11px] font-bold ${isAdminMsg ? 'text-xena-primary' : 'text-xena-muted'}`}>{msg.senderName}</span>
                      <span className="text-[10px] text-xena-muted ml-auto">{timeAgo(msg.timestamp)}</span>
                    </div>
                    <p className="text-[13px] text-white">{msg.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedTicket.status !== 'closed' ? (
            <div className="border-t border-white/10 pt-3 pb-2 space-y-2">
              <div className="flex items-end gap-2">
                <input
                  type="text"
                  placeholder="Yanıtınızı yazın..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && replyText.trim()) {
                      replyToTicket(selectedTicket.id, currentUser!.id, currentUser!.username, currentUser!.role, replyText.trim());
                      setReplyText('');
                      setSelectedTicket((prev: any) => ({
                        ...prev,
                        messages: [...prev.messages, { id: Date.now().toString(), senderId: currentUser!.id, senderName: currentUser!.username, text: replyText.trim(), timestamp: Date.now() }],
                      }));
                    }
                  }}
                  className="flex-1 bg-xena-surface border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
                />
                <button
                  onClick={() => {
                    if (!replyText.trim()) return;
                    replyToTicket(selectedTicket.id, currentUser!.id, currentUser!.username, currentUser!.role, replyText.trim());
                    setReplyText('');
                  }}
                  disabled={!replyText.trim()}
                  className={`p-2.5 rounded-full transition-all active:scale-95 ${replyText.trim() ? 'bg-xena-primary text-white' : 'bg-xena-surface text-xena-muted'}`}
                >
                  <Send size={16} />
                </button>
              </div>
              {isAdmin && (
                <button onClick={() => { closeTicket(selectedTicket.id); setSelectedTicket({ ...selectedTicket, status: 'closed' }); }} className="flex items-center gap-1 text-xs text-xena-danger font-bold">
                  <X size={14} /> Talebi Kapat
                </button>
              )}
            </div>
          ) : (
            <div className="border-t border-white/10 pt-3 pb-2 flex items-center justify-between">
              <span className="text-xs text-xena-muted">Bu talep kapatıldı.</span>
              <button onClick={() => { reopenTicket(selectedTicket.id); setSelectedTicket({ ...selectedTicket, status: 'open' }); }} className="flex items-center gap-1 text-xs text-xena-primary font-bold">
                <RefreshCw size={13} /> Yeniden Aç
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
