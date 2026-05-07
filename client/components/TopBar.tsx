import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Shield, User, RotateCcw, LogOut, Trophy, Crown, MessageCircle } from 'lucide-react';
import { useAuth, ROLE_COLORS } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useWheel } from '../context/WheelContext';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import LuckyWheelModal from './LuckyWheelModal';
import NotificationModal from './NotificationModal';

export default function TopBar() {
  const { currentUser, isLoggedIn, isMod, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { canSpin, config } = useWheel();
  const [onlineCount, setOnlineCount] = useState(2187);

  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  const navigate = useNavigate();
  const spinAvailable = currentUser ? canSpin(currentUser.id) : false;
  const roleColor = currentUser ? ROLE_COLORS[currentUser.role] ?? '#9147ff' : '#9147ff';

  useEffect(() => {
    const interval = setInterval(() => {
      const drift = Math.floor((Math.random() - 0.5) * 30);
      setOnlineCount((c) => Math.max(config.onlineRange.min, Math.min(config.onlineRange.max, c + drift)));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 safe-top bg-gradient-to-b from-xena-bg to-xena-card border-b border-white/[0.04]">
        {/* Brand */}
        <div className="flex items-center gap-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center mr-1">
            <span className="text-sm font-black text-white">X</span>
          </div>
          <span className="text-lg font-black text-white tracking-wider">XENA</span>
          <motion.span
            className="text-lg font-black text-xena-primary tracking-wider"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            HUB
          </motion.span>
          <div className="flex items-center gap-1 ml-2 bg-xena-success/10 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-xena-success animate-pulse" />
            <span className="text-[10px] font-bold text-xena-success">{onlineCount.toLocaleString('tr-TR')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* 🇹🇷 */}
          <span className="text-lg leading-none">🇹🇷</span>

          {isLoggedIn && (
            <>
              {/* Wheel */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowWheel(true)}
                className="relative w-9 h-9 rounded-full flex items-center justify-center border"
                style={{
                  background: spinAvailable ? 'rgba(255,215,0,0.10)' : 'rgba(255,255,255,0.06)',
                  borderColor: spinAvailable ? 'rgba(255,215,0,0.25)' : 'transparent',
                }}
              >
                <span className="text-base">🎡</span>
                {spinAvailable && (
                  <>
                    <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-xena-success border-2 border-xena-bg" />
                    <span className="absolute -bottom-3 text-[8px] font-extrabold text-yellow-400 tracking-wide">ÇEVİR</span>
                  </>
                )}
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowNotifications(true)}
                className="relative w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center"
              >
                <Bell size={16} className={unreadCount > 0 ? 'text-yellow-400' : 'text-xena-muted'} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-xena-danger rounded-full flex items-center justify-center text-[9px] font-black text-white px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </motion.button>
            </>
          )}

          {/* Admin */}
          {isMod && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => navigate('/admin')}
              className="w-9 h-9 rounded-full bg-xena-primary/10 border border-xena-primary/20 flex items-center justify-center"
              title="Admin Panel"
            >
              <Shield size={16} className="text-xena-primary" />
            </motion.button>
          )}

          {/* User / Login */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => isLoggedIn ? setShowProfile(true) : setShowAuth(true)}
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 transition-all"
            style={{
              background: isLoggedIn ? `${roleColor}15` : 'rgba(255,255,255,0.06)',
              borderColor: isLoggedIn ? `${roleColor}40` : 'transparent',
            }}
          >
            {isLoggedIn && currentUser ? (
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: `${roleColor}33`, color: roleColor }}>
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  currentUser.username[0].toUpperCase()
                )}
              </div>
            ) : (
              <>
                <User size={14} className="text-xena-muted" />
                <span className="text-xs font-semibold text-xena-muted">Giriş</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />
      <ProfileModal visible={showProfile} onClose={() => setShowProfile(false)} />
      {isLoggedIn && (
        <>
          <NotificationModal visible={showNotifications} onClose={() => setShowNotifications(false)} />
          <LuckyWheelModal visible={showWheel} onClose={() => setShowWheel(false)} />
        </>
      )}
    </>
  );
}
