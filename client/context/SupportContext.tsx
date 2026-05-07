import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Dexie from 'dexie';

const db = new Dexie('xenahub_support') as any;
db.version(1).stores({ tickets: 'id' });

export type TicketCategory = 'teknik' | 'hesap' | 'odeme' | 'icerik' | 'diger';

export interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: number;
  imageBase64?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  username: string;
  title: string;
  category: TicketCategory;
  messages: TicketMessage[];
  status: 'open' | 'in_progress' | 'closed';
  createdAt: number;
  updatedAt: number;
  unreadByUser: boolean;
  unreadByAdmin: boolean;
  photoBase64?: string;
}

interface SupportContextValue {
  tickets: SupportTicket[];
  createTicket: (userId: string, username: string, title: string, category: TicketCategory, message: string, image?: string) => SupportTicket;
  replyToTicket: (ticketId: string, senderId: string, senderName: string, senderRole: string | undefined, text: string, image?: string) => void;
  closeTicket: (ticketId: string) => void;
  reopenTicket: (ticketId: string) => void;
  markReadByUser: (ticketId: string) => void;
  markReadByAdmin: (ticketId: string) => void;
  getUserTickets: (userId: string) => SupportTicket[];
}

const SupportContext = createContext<SupportContextValue | null>(null);

export function SupportProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const data = await db.tickets.toArray();
      if (data && data.length > 0) setTickets(data);
    } catch { /* ignore */ }
  };

  const save = async (t: SupportTicket[]) => {
    await db.tickets.clear();
    await db.tickets.bulkPut(t);
  };

  const createTicket = useCallback((userId: string, username: string, title: string, category: TicketCategory, message: string, image?: string): SupportTicket => {
    const now = Date.now();
    const ticket: SupportTicket = {
      id: now.toString(),
      userId,
      username,
      title,
      category,
      messages: [{ id: now + 'm', senderId: userId, senderName: username, text: message, timestamp: now }],
      status: 'open',
      createdAt: now,
      updatedAt: now,
      unreadByUser: false,
      unreadByAdmin: true,
      photoBase64: image,
    };
    setTickets((prev) => { const next = [ticket, ...prev]; save(next); return next; });
    return ticket;
  }, []);

  const replyToTicket = useCallback((ticketId: string, senderId: string, senderName: string, senderRole: string | undefined, text: string, image?: string) => {
    const now = Date.now();
    setTickets((prev) => {
      const next = prev.map((t) => {
        if (t.id !== ticketId) return t;
        const isAdminReply = senderRole === 'admin' || senderRole === 'moderator';
        const newStatus = (t.status === 'closed' ? 'open' : 'in_progress') as 'open' | 'in_progress' | 'closed';
        return {
          ...t,
          messages: [...t.messages, { id: now.toString(), senderId, senderName, senderRole, text, timestamp: now, imageBase64: image }],
          updatedAt: now,
          status: newStatus,
          unreadByUser: isAdminReply,
          unreadByAdmin: !isAdminReply,
        };
      });
      save(next);
      return next;
    });
  }, []);

  const closeTicket = useCallback((ticketId: string) => {
    setTickets((prev) => { const next = prev.map((t) => t.id === ticketId ? { ...t, status: 'closed' as const } : t); save(next); return next; });
  }, []);

  const reopenTicket = useCallback((ticketId: string) => {
    setTickets((prev) => { const next = prev.map((t) => t.id === ticketId ? { ...t, status: 'open' as const } : t); save(next); return next; });
  }, []);

  const markReadByUser = useCallback((ticketId: string) => {
    setTickets((prev) => { const next = prev.map((t) => t.id === ticketId ? { ...t, unreadByUser: false } : t); save(next); return next; });
  }, []);

  const markReadByAdmin = useCallback((ticketId: string) => {
    setTickets((prev) => { const next = prev.map((t) => t.id === ticketId ? { ...t, unreadByAdmin: false } : t); save(next); return next; });
  }, []);

  const getUserTickets = useCallback((userId: string) => {
    return tickets.filter((t) => t.userId === userId);
  }, [tickets]);

  return (
    <SupportContext.Provider value={{ tickets, createTicket, replyToTicket, closeTicket, reopenTicket, markReadByUser, markReadByAdmin, getUserTickets }}>
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport() {
  const ctx = useContext(SupportContext);
  if (!ctx) throw new Error('useSupport must be inside SupportProvider');
  return ctx;
}

export default SupportContext;
