import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Pin, PinOff, Users, ImagePlus, Trash2 } from 'lucide-react';
import { useAuth, ROLE_COLORS } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function ChatBubble() {
  const { currentUser, isLoggedIn, canWrite, isMod } = useAuth();
  const { messages, pinnedMessages, sendMessage, pinMessage, unpinMessage, clearChat } = useChat();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [fullImage, setFullImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

  const handleSend = () => {
    if ((!text.trim() && !image) || !currentUser || !canWrite) return;
    sendMessage(currentUser.id, currentUser.username, currentUser.role, text.trim(), image);
    setText(''); setImage(undefined);
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Sadece resim yukleyin');
    if (file.size > 5 * 1024 * 1024) return alert('Resim cok buyuk. 5MB altinda yukleyin.');
    const r = new FileReader();
    r.onload = () => setImage(String(r.result));
    r.readAsDataURL(file);
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => setOpen(!open)} className="w-14 h-14 rounded-full bg-xena-primary shadow-neon flex items-center justify-center">
          <MessageCircle size={24} className="text-white" />
          {messages.length > 0 && messages[messages.length - 1].senderId !== currentUser?.id && <span className="absolute -top-1 -right-1 w-5 h-5 bg-xena-danger rounded-full flex items-center justify-center text-[10px] font-black text-white">!</span>}
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 10 }} className="absolute bottom-16 right-0 w-[85vw] max-w-[380px] max-h-[65dvh] glass rounded-2xl border border-white/[0.08] overflow-hidden shadow-glass">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2"><Users size={16} className="text-xena-primary" /><span className="text-sm font-bold text-white">Sohbet Odasi</span></div>
                <div className="flex items-center gap-2">
                  {isMod && <button onClick={() => { if (confirm('Sohbet tamamen temizlensin mi?')) clearChat(); }} className="text-xena-danger hover:text-red-300"><Trash2 size={15} /></button>}
                  <button onClick={() => setOpen(false)} className="text-xena-muted hover:text-white"><X size={16} /></button>
                </div>
              </div>

              {pinnedMessages.length > 0 && <div className="px-3 py-2 bg-xena-primary/5 border-b border-white/[0.04]">{pinnedMessages.map((msg) => <div key={msg.id} className="flex items-start gap-2"><Pin size={12} className="text-xena-primary shrink-0 mt-0.5" /><p className="text-[11px] text-xena-accent line-clamp-1">{msg.text || 'Resim'}</p></div>)}</div>}

              <div ref={scrollRef} className="px-3 py-2 space-y-2 overflow-y-auto no-scrollbar h-[37dvh]">
                {messages.length === 0 && <p className="text-center text-xs text-xena-muted py-8">Sohbete baslamak icin mesaj gonderin</p>}
                {messages.map((msg) => {
                  const isMine = msg.senderId === currentUser?.id;
                  const isSystem = msg.senderId === 'system';
                  return <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-snug ${isSystem ? 'bg-xena-primary/10 text-xena-accent text-[11px]' : isMine ? 'bg-xena-primary/20 text-white' : 'bg-xena-surface text-white'}`}>{!isMine && !isSystem && <span className="text-[10px] font-bold" style={{ color: msg.senderRole && msg.senderRole in ROLE_COLORS ? ROLE_COLORS[(msg.senderRole as keyof typeof ROLE_COLORS)] : '#adadb8' }}>{msg.senderName}</span>}{msg.text && <p className="mt-0.5 whitespace-pre-wrap break-words">{msg.text}</p>}{msg.image && <img src={msg.image} onClick={() => setFullImage(msg.image!)} className="mt-2 rounded-xl max-h-44 object-cover cursor-pointer hover:opacity-90" />}{isMod && <button onClick={() => msg.pinned ? unpinMessage(msg.id) : pinMessage(msg.id)} className="mt-1 opacity-60 hover:opacity-100">{msg.pinned ? <PinOff size={12} className="text-xena-muted" /> : <Pin size={12} className="text-xena-muted" />}</button>}</div></div>;
                })}
              </div>

              <div className="px-3 py-2 border-t border-white/[0.06]">
                {image && <div className="mb-2 relative w-24"><img src={image} className="w-24 h-16 object-cover rounded-lg" /><button onClick={() => setImage(undefined)} className="absolute -top-2 -right-2 bg-xena-danger rounded-full p-1"><X size={10} /></button></div>}
                <div className="flex items-center gap-2">
                  <label className={`p-2 rounded-full ${canWrite ? 'bg-xena-surface text-xena-primary' : 'bg-xena-surface text-xena-muted'}`}><ImagePlus size={16} /><input type="file" accept="image/*" disabled={!canWrite} className="hidden" onChange={(e) => handleImage(e.target.files?.[0])} /></label>
                  <input type="text" placeholder={canWrite ? 'Mesaj yaz...' : 'Banlandiniz'} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }} disabled={!canWrite} className="flex-1 bg-xena-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-xena-muted outline-none focus:border-xena-primary" />
                  <motion.button whileTap={{ scale: 0.85 }} onClick={handleSend} disabled={(!text.trim() && !image) || !canWrite} className={`p-2 rounded-full ${(text.trim() || image) && canWrite ? 'bg-xena-primary text-white' : 'bg-xena-surface text-xena-muted'}`}><Send size={16} /></motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center" 
            onClick={() => setFullImage(null)}
          >
            <button 
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 z-[101]" 
              onClick={() => setFullImage(null)}
            >
              <X size={28} />
            </button>
            <img 
              src={fullImage} 
              className="max-w-none w-auto h-auto max-h-screen max-w-screen object-contain" 
              style={{ minWidth: 'auto', minHeight: 'auto' }}
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
