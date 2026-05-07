import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AuthModal({ visible, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let result;
    if (mode === 'login') {
      result = await login(username, password);
    } else {
      result = await register(username, email, password);
    }
    setLoading(false);
    if (result.success) {
      onClose();
      setUsername(''); setEmail(''); setPassword('');
    } else {
      setError(result.error || 'Bir hata oluştu');
    }
  };

  if (!visible) return null;

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
            <h2 className="text-xl font-extrabold text-white mb-6">
              {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xena-muted" />
                  <input
                    type="text"
                    placeholder="Kullanıcı adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-xena-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
                  />
                </div>
              </div>
              {mode === 'register' && (
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xena-muted" />
                  <input
                    type="email"
                    placeholder="E-posta"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-xena-surface border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
                  />
                </div>
              )}
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xena-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-xena-surface border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-xena-muted outline-none focus:border-xena-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xena-muted"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-xena-danger font-semibold">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.96]"
              >
                {loading ? 'Yükleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
              </button>
            </form>
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="w-full text-center text-xs text-xena-muted mt-4 hover:text-white transition-colors"
            >
              {mode === 'login' ? 'Hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
