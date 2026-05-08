import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWheel } from '../context/WheelContext';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';

export default function LuckyWheelModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { currentUser } = useAuth();
  const { spin, canSpin, getSpinState, rewards } = useWheel();
  const { addCoins, balance } = useWallet();
  const { addNotification } = useNotifications();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ label: string; type: string; value: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const spinAvailable = currentUser ? canSpin(currentUser.id) : false;
  const spinState = currentUser ? getSpinState(currentUser.id) : null;
  
  // Calculate segment angle
  const segmentAngle = 360 / rewards.length;
  
  // Get current balance
  const currentBalance = currentUser ? balance(currentUser.id) : 0;

  const handleSpin = () => {
    if (!currentUser || spinning || !spinAvailable) return;
    setSpinning(true);
    setShowResult(false);
    setResult(null);
    
    const { reward } = spin(currentUser.id, currentUser.username);
    
    // Find reward index
    const idx = rewards.findIndex(r => r.id === reward.id);
    
    // Calculate target rotation
    // We want the pointer (at top, -90deg) to land on the selected segment
    // Each segment starts at idx * segmentAngle
    const targetSegment = idx;
    const randomOffset = Math.random() * (segmentAngle - 10) + 5; // Random within segment
    const targetAngle = 360 - (targetSegment * segmentAngle + randomOffset) - 90;
    
    // Add multiple full rotations for effect
    const fullRotations = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalRotation = rotation + (fullRotations * 360) + targetAngle;
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setSpinning(false);
      setResult({ label: reward.label, type: reward.type, value: reward.value });
      setShowResult(true);
      
      if (reward.type === 'gold' && reward.value > 0) {
        addCoins(currentUser.id, reward.value, 'Şans Çarkı');
        addNotification({ type: 'prize', title: '🎉 Kazandın!', body: `${reward.label} kazandın!` });
      } else if (reward.type === 'spin') {
        addNotification({ type: 'prize', title: '🎡 Ekstra Hak!', body: `Bir spin hakkı daha kazandın!` });
      } else {
        addNotification({ type: 'system', title: '😕 Boş', body: 'Bu sefer şans yanında değildi.' });
      }
    }, 5000);
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
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">🎡 Şans Çarkı</h2>
                <p className="text-xs text-xena-muted">Altın kazanmak için çevir!</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xena-muted hover:text-white hover:bg-white/20">
                <X size={20} />
              </button>
            </div>

            {/* Wallet Info */}
            <div className="glass rounded-2xl p-4 mb-6 border border-xena-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={20} className="text-xena-gold" />
                  <span className="text-sm text-xena-muted">Cüzdan</span>
                </div>
                <span className="text-xl font-black text-xena-gold">{currentBalance.toLocaleString()} Altın</span>
              </div>
              {spinState && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-xena-muted">Kalan Hak</span>
                  <span className={`text-sm font-bold ${spinState.remainingSpins > 0 ? 'text-xena-primary' : 'text-xena-muted'}`}>
                    {spinState.remainingSpins} / {spinState.totalSpins} çevirme
                  </span>
                </div>
              )}
            </div>

            {/* 3D Wheel Container */}
            <div className="relative w-72 h-72 mx-auto mb-8">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-xena-primary/30 via-xena-accent/30 to-xena-primary/30 blur-2xl" />
              
              {/* Wheel */}
              <div 
                className="relative w-full h-full rounded-full border-4 border-xena-primary/50 shadow-2xl"
                style={{
                  background: `conic-gradient(${rewards.map((r, i) => `${r.color} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`).join(', ')})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                  boxShadow: '0 0 60px rgba(145, 71, 255, 0.4), inset 0 0 40px rgba(0,0,0,0.5)',
                }}
              >
                {/* Inner circle with labels */}
                {rewards.map((reward, i) => {
                  const angle = i * segmentAngle;
                  const rotate = angle + segmentAngle / 2;
                  return (
                    <div
                      key={reward.id}
                      className="absolute w-full h-full flex items-center justify-center"
                      style={{
                        transform: `rotate(${rotate}deg)`,
                      }}
                    >
                      <span 
                        className="text-xs font-black text-white drop-shadow-lg"
                        style={{
                          transform: `translateY(-110px) rotate(90deg)`,
                          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        }}
                      >
                        {reward.label.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
                
                {/* Center hub */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center shadow-xl border-4 border-white/20">
                    <span className="text-2xl">🎡</span>
                  </div>
                </div>
              </div>
              
              {/* Pointer */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[24px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}
                />
              </div>
              
              {/* Outer ring decoration */}
              <div className="absolute -inset-3 rounded-full border-2 border-dashed border-xena-primary/30 animate-spin"
                style={{ animationDuration: '20s' }}
              />
            </div>

            {/* Result Display */}
            <AnimatePresence>
              {showResult && result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center mb-6"
                >
                  <div className={`inline-block px-6 py-3 rounded-2xl ${result.type === 'gold' ? 'bg-yellow-500/20 border border-yellow-500/50' : result.type === 'spin' ? 'bg-xena-primary/20 border border-xena-primary/50' : 'bg-xena-surface border border-white/10'}`}>
                    <p className="text-sm text-xena-muted mb-1">Sonuç</p>
                    <p className={`text-2xl font-black ${result.type === 'gold' ? 'text-yellow-400' : result.type === 'spin' ? 'text-xena-primary' : 'text-xena-muted'}`}>
                      {result.type === 'gold' ? '🎉 ' : result.type === 'spin' ? '🎡 ' : '😕 '}
                      {result.label}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spin Button */}
            <button
              onClick={handleSpin}
              disabled={spinning || !spinAvailable}
              className={`w-full py-4 rounded-2xl text-base font-black tracking-wide transition-all active:scale-[0.96] shadow-lg ${
                spinAvailable 
                  ? 'bg-gradient-to-r from-xena-primary to-xena-accent text-white shadow-xena-primary/30 hover:shadow-xena-primary/50' 
                  : 'bg-xena-surface text-xena-muted cursor-not-allowed'
              }`}
            >
              {spinning ? (
                <span className="flex items-center justify-center gap-2">
                  <RotateCcw size={20} className="animate-spin" />
                  Çevriliyor...
                </span>
              ) : spinAvailable ? (
                'ÇEVİR 🎰'
              ) : (
                'Hakkın Yok ⏰'
              )}
            </button>
            
            {!spinAvailable && spinState && (
              <p className="text-center text-xs text-xena-muted mt-3">
                Yeni hak için bekleyin...
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
