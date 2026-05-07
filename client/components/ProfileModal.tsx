import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Edit2, Check, User, Award, Shield } from 'lucide-react';
import { useAuth, ROLE_LABELS, ROLE_COLORS } from '../context/AuthContext';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({ visible, onClose }: ProfileModalProps) {
  const { currentUser, logout, updateProfile, updateAvatar, removeAvatar, isLoggedIn } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const handleAvatarUpload = (file?: File) => {
    if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = () => updateAvatar(currentUser.id, String(reader.result));
    reader.readAsDataURL(file);
  };

  if (!visible || !isLoggedIn || !currentUser) return null;

  const roleColor = ROLE_COLORS[currentUser.role];
  const roleLabel = ROLE_LABELS[currentUser.role];

  const handleSave = async () => {
    await updateProfile(currentUser.id, { displayName, username });
    setEditing(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm glass rounded-3xl p-6 border border-white/[0.08]"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-xena-muted hover:text-white">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl font-black mb-3" style={{ borderColor: roleColor, background: `${roleColor}22` }}>
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span style={{ color: roleColor }}>{currentUser.username[0].toUpperCase()}</span>
                )}
              </div>
              <label className="text-xs font-bold text-xena-primary mb-3 cursor-pointer bg-xena-primary/10 px-3 py-1 rounded-full">Resim Ekle<input type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarUpload(e.target.files?.[0])} /></label>
              {currentUser.avatarUrl && <button onClick={() => removeAvatar(currentUser.id)} className="text-[10px] text-xena-danger mb-2">Resmi Kaldir</button>}
              <h2 className="text-lg font-extrabold text-white">{currentUser.displayName || currentUser.username}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${roleColor}22`, color: roleColor }}>
                  {currentUser.role === 'admin' ? '🛡️' : currentUser.role === 'moderator' ? '⭐' : '👤'} {roleLabel}
                </span>
                {currentUser.verified && <span className="text-xs text-xena-success">✓ Doğrulanmış</span>}
              </div>
            </div>

            <div className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-xena-muted">Kullanıcı Adı</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-xena-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-xena-primary mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-xena-muted">Görünen İsim</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-xena-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-xena-primary mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-bold active:scale-[0.96]">
                      <Check size={14} className="inline mr-1" /> Kaydet
                    </button>
                    <button onClick={() => setEditing(false)} className="flex-1 btn-secondary py-2.5 rounded-xl text-sm font-bold active:scale-[0.96]">
                      İptal
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-xs text-xena-muted">E-posta</span>
                      <span className="text-sm text-white">{currentUser.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                      <span className="text-xs text-xena-muted">Üyelik Tarihi</span>
                      <span className="text-sm text-white">{new Date(currentUser.createdAt || Date.now()).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {currentUser.appId && (
                      <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                        <span className="text-xs text-xena-muted">App ID</span>
                        <span className="text-sm text-white">{currentUser.appId}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-white hover:bg-white/[0.04] transition-all active:scale-[0.96]"
                  >
                    <Edit2 size={14} /> Profili Düzenle
                  </button>
                </>
              )}
              <button
                onClick={async () => { await logout(); onClose(); }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-xena-surface border border-xena-danger/20 text-sm font-bold text-xena-danger hover:bg-xena-danger/10 transition-all active:scale-[0.96]"
              >
                <LogOut size={14} /> Çıkış Yap
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}




