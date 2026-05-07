import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_chat') as any;
db.version(1).stores({ messages: 'id', users: 'id' });

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: number;
  pinned?: boolean;
  replyTo?: string;
  image?: string;
}

interface ChatContextValue {
  messages: ChatMessage[];
  onlineUsers: string[];
  sendMessage: (userId: string, username: string, role: string | undefined, text: string, image?: string) => { success: boolean; error?: string };
  pinnedMessages: ChatMessage[];
  pinMessage: (id: string) => void;
  unpinMessage: (id: string) => void;
  clearChat: () => void;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const SEED_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: 'system', senderName: 'Sistem', text: 'XENAHUB sohbet odasina hos geldiniz!', timestamp: Date.now() - 86400000, pinned: true },
  { id: 'm2', senderId: 'seed1', senderName: 'KralGamer_TR', senderRole: 'yetkili', text: 'Bugun 21:00de Valorant turnuvasi var, kacirmayin!', timestamp: Date.now() - 3600000 },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers] = useState<string[]>(['KralGamer_TR', 'ZeynepPlay', 'Admin', 'CanGamer', 'ElifPlay']);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await db.messages.toArray();
      if (data && data.length > 0) setMessages(data);
      else { await db.messages.bulkPut(SEED_MESSAGES); setMessages(SEED_MESSAGES); }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const onClear = () => { setMessages([]); db.messages.clear(); };
    const storageHandler = (e: StorageEvent) => { if (e.key === 'xenahub_chat_clear_signal') onClear(); };
    window.addEventListener('storage', storageHandler);
    window.addEventListener('xenahub:chat-clear', onClear as EventListener);
    return () => { window.removeEventListener('storage', storageHandler); window.removeEventListener('xenahub:chat-clear', onClear as EventListener); };
  }, []);

  const save = async (m: ChatMessage[]) => { await db.messages.clear(); if (m.length) await db.messages.bulkPut(m); };

  const sendMessage = useCallback((userId: string, username: string, role: string | undefined, text: string, image?: string) => {
    if (!text.trim() && !image) return { success: false, error: 'Mesaj bos olamaz' };
    if (text.length > 500) return { success: false, error: 'Mesaj cok uzun (max 500 karakter)' };
    const entry: ChatMessage = { id: Date.now().toString(), senderId: userId, senderName: username, senderRole: role, text: text.trim(), image, timestamp: Date.now() };
    setMessages((prev) => { const next = [...prev, entry]; save(next); return next; });
    return { success: true };
  }, []);

  const pinMessage = useCallback((id: string) => { setMessages((prev) => { const next = prev.map((m) => m.id === id ? { ...m, pinned: true } : m); save(next); return next; }); }, []);
  const unpinMessage = useCallback((id: string) => { setMessages((prev) => { const next = prev.map((m) => m.id === id ? { ...m, pinned: false } : m); save(next); return next; }); }, []);
  const clearChat = useCallback(() => { setMessages([]); db.messages.clear(); localStorage.setItem('xenahub_chat_clear_signal', Date.now().toString()); window.dispatchEvent(new CustomEvent('xenahub:chat-clear')); }, []);
  const pinnedMessages = messages.filter((m) => m.pinned);

  return <ChatContext.Provider value={{ messages, onlineUsers, sendMessage, pinnedMessages, pinMessage, unpinMessage, clearChat, replyTo, setReplyTo }}>{children}</ChatContext.Provider>;
}

export function useChat() { const ctx = useContext(ChatContext); if (!ctx) throw new Error('useChat must be inside ChatProvider'); return ctx; }
export default ChatContext;
