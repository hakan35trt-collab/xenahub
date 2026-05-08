import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_chat') as any;
db.version(1).stores({ messages: 'id', users: 'id' });

const get = <T,>(key: string, fallback: T): T => { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const set = <T,>(key: string, data: T) => { try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* ignore */ } };

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

export interface SystemUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  color: string;
}

export interface BotMessage {
  id: string;
  text: string;
  delay: number; // minutes
  enabled: boolean;
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
  welcomeMessage: string;
  setWelcomeMessage: (text: string) => void;
  systemUsers: SystemUser[];
  addSystemUser: (user: Omit<SystemUser, 'id'>) => void;
  removeSystemUser: (id: string) => void;
  sendAsSystemUser: (userId: string, text: string) => void;
  botMessages: BotMessage[];
  addBotMessage: (msg: Omit<BotMessage, 'id'>) => void;
  removeBotMessage: (id: string) => void;
  toggleBotMessage: (id: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const DEFAULT_SYSTEM_USERS: SystemUser[] = [
  { id: 'sys1', name: 'XENABOT', role: 'bot', color: '#9147ff' },
  { id: 'sys2', name: 'TurnuvaBot', role: 'bot', color: '#FFD700' },
];

const DEFAULT_BOT_MESSAGES: BotMessage[] = [
  { id: 'bm1', text: 'Bugun 21:00de Valorant turnuvasi var!', delay: 60, enabled: true },
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers] = useState<string[]>(['KralGamer_TR', 'ZeynepPlay', 'Admin', 'CanGamer', 'ElifPlay']);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessageState] = useState<string>(() => get('xenahub_chat_welcome', 'XENAHUB sohbet odasina hos geldiniz!'));
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => get('xenahub_system_users', DEFAULT_SYSTEM_USERS));
  const [botMessages, setBotMessages] = useState<BotMessage[]>(() => get('xenahub_bot_messages', DEFAULT_BOT_MESSAGES));

  const setWelcomeMessage = useCallback((text: string) => {
    set('xenahub_chat_welcome', text);
    setWelcomeMessageState(text);
  }, []);

  const addSystemUser = useCallback((user: Omit<SystemUser, 'id'>) => {
    const newUser: SystemUser = { ...user, id: Date.now().toString() };
    setSystemUsers(prev => {
      const next = [...prev, newUser];
      set('xenahub_system_users', next);
      return next;
    });
  }, []);

  const removeSystemUser = useCallback((id: string) => {
    setSystemUsers(prev => {
      const next = prev.filter(u => u.id !== id);
      set('xenahub_system_users', next);
      return next;
    });
  }, []);

  const sendAsSystemUser = useCallback((userId: string, text: string) => {
    const user = systemUsers.find(u => u.id === userId);
    if (!user) return;
    const entry: ChatMessage = { 
      id: Date.now().toString(), 
      senderId: user.id, 
      senderName: user.name, 
      senderRole: user.role, 
      text: text.trim(), 
      timestamp: Date.now() 
    };
    setMessages((prev) => { const next = [...prev, entry]; saveMessages(next); return next; });
  }, [systemUsers]);

  const addBotMessage = useCallback((msg: Omit<BotMessage, 'id'>) => {
    const newMsg: BotMessage = { ...msg, id: Date.now().toString() };
    setBotMessages(prev => {
      const next = [...prev, newMsg];
      set('xenahub_bot_messages', next);
      return next;
    });
  }, []);

  const removeBotMessage = useCallback((id: string) => {
    setBotMessages(prev => {
      const next = prev.filter(m => m.id !== id);
      set('xenahub_bot_messages', next);
      return next;
    });
  }, []);

  const toggleBotMessage = useCallback((id: string) => {
    setBotMessages(prev => {
      const next = prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
      set('xenahub_bot_messages', next);
      return next;
    });
  }, []);

  const getSeedMessages = useCallback((): ChatMessage[] => {
    return [
      { id: 'm1', senderId: 'system', senderName: 'Sistem', text: welcomeMessage, timestamp: Date.now() - 86400000, pinned: true },
    ];
  }, [welcomeMessage]);

  const load = async () => {
    try {
      const data = await db.messages.toArray();
      if (data && data.length > 0) setMessages(data);
      else { const seed = getSeedMessages(); await db.messages.bulkPut(seed); setMessages(seed); }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    load();
    const onClear = () => { setMessages([]); db.messages.clear(); };
    const storageHandler = (e: StorageEvent) => { 
      if (e.key === 'xenahub_chat_clear_signal') onClear(); 
      if (e.key === 'xenahub_chat_welcome') {
        const newMsg = get('xenahub_chat_welcome', 'XENAHUB sohbet odasina hos geldiniz!');
        setWelcomeMessageState(newMsg);
      }
      if (e.key === 'xenahub_system_users') {
        setSystemUsers(get('xenahub_system_users', DEFAULT_SYSTEM_USERS));
      }
      if (e.key === 'xenahub_bot_messages') {
        setBotMessages(get('xenahub_bot_messages', DEFAULT_BOT_MESSAGES));
      }
    };
    window.addEventListener('storage', storageHandler);
    window.addEventListener('xenahub:chat-clear', onClear as EventListener);
    return () => { window.removeEventListener('storage', storageHandler); window.removeEventListener('xenahub:chat-clear', onClear as EventListener); };
  }, []);

  const saveMessages = async (m: ChatMessage[]) => { await db.messages.clear(); if (m.length) await db.messages.bulkPut(m); };

  const sendMessage = useCallback((userId: string, username: string, role: string | undefined, text: string, image?: string) => {
    if (!text.trim() && !image) return { success: false, error: 'Mesaj bos olamaz' };
    if (text.length > 500) return { success: false, error: 'Mesaj cok uzun (max 500 karakter)' };
    const entry: ChatMessage = { id: Date.now().toString(), senderId: userId, senderName: username, senderRole: role, text: text.trim(), image, timestamp: Date.now() };
    setMessages((prev) => { const next = [...prev, entry]; saveMessages(next); return next; });
    return { success: true };
  }, []);

  const pinMessage = useCallback((id: string) => { setMessages((prev) => { const next = prev.map((m) => m.id === id ? { ...m, pinned: true } : m); saveMessages(next); return next; }); }, []);
  const unpinMessage = useCallback((id: string) => { setMessages((prev) => { const next = prev.map((m) => m.id === id ? { ...m, pinned: false } : m); saveMessages(next); return next; }); }, []);
  const clearChat = useCallback(() => { setMessages([]); db.messages.clear(); localStorage.setItem('xenahub_chat_clear_signal', Date.now().toString()); window.dispatchEvent(new CustomEvent('xenahub:chat-clear')); }, []);
  const pinnedMessages = messages.filter((m) => m.pinned);

  return <ChatContext.Provider value={{ 
    messages, onlineUsers, sendMessage, pinnedMessages, pinMessage, unpinMessage, clearChat, replyTo, setReplyTo, 
    welcomeMessage, setWelcomeMessage,
    systemUsers, addSystemUser, removeSystemUser, sendAsSystemUser,
    botMessages, addBotMessage, removeBotMessage, toggleBotMessage
  }}>{children}</ChatContext.Provider>;
}

export function useChat() { const ctx = useContext(ChatContext); if (!ctx) throw new Error('useChat must be inside ChatProvider'); return ctx; }
export default ChatContext;
