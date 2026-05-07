import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWheel } from '../context/WheelContext';
import { useWallet } from '../context/WalletContext';
import { useNotifications } from '../context/NotificationContext';

const SEGMENTS = [
  { label: '25', color: '#FFD700' },
  { label: 'Boş', color: '#6b6b8a' },
  { label: '50', color: '#FFD700' },
  { label: 'Boş', color: '#6b6b8a' },
  { label: '100', color: '#FFD700' },
  { label: 'Boş', color: '#6b6b8a' },
  { label: '250', color: '#FFD700' },
  { label: 'Spin', color: '#9147ff' },
];

export default function LuckyWheelModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { currentUser } = useAuth();
  const { spin, canSpin, getSpinState } = useWheel();
  const { addCoins } = useWallet();
  const { addNotification } = useNotifications();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const spinAvailable = currentUser ? canSpin(currentUser.id) : false;

  const handleSpin = () => {
    if (!currentUser || spinning || !spinAvailable) return;
    setSpinning(true);
    const { reward } = spin(currentUser.id, currentUser.username);
    const idx = SEGMENTS.findIndex((s) => (reward.type === 'gold' ? s.label === String(reward.value) : s.label === reward.type));
    const segmentAngle = 360 / SEGMENTS.length;
    const randomOffset = Math.random() * segmentAngle;
    const targetAngle = idx * segmentAngle + randomOffset + 1800;
    setRotation((prev) => prev + targetAngle);
    setTimeout(() => {
      setSpinning(false);
      setResult(reward.label);
      if (reward.type === 'gold' && reward.value > 0) {
        addCoins(currentUser.id, reward.value, 'Şans Çarkı');
        addNotification({ type: 'prize', title: '🎉 Kazandın!', body: `${reward.label} altın kazandın!` });
      } else if (reward.type === 'spin') {
        addNotification({ type: 'prize', title: '🎡 Ekstra Hak!', body: `Bir spin hakkı daha kazandın!` });
      } else {
        addNotification({ type: 'system', title: '😕 Boş', body: 'Bu sefer şans yanında değildi.' });
      }
    }, 4000);
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
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
            <h2 className="text-xl font-extrabold text-white text-center mb-6">🎡 Şans Çarkı</h2>

            <div className="relative w-64 h-64 mx-auto mb-6">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(${SEGMENTS.map((s, i) => `${s.color} ${i * (360 / SEGMENTS.length)}deg ${(i + 1) * (360 / SEGMENTS.length)}deg`).join(', ')})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
              />
              <div className="absolute inset-3 rounded-full bg-xena-surface" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎡</span>
              </div>
              {/* Pointer */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[16px] border-transparent border-b-yellow-400 z-10" />
            </div>

            <div className="text-center mb-4">
              {result && !spinning && (
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-lg font-bold text-yellow-400">
                  {result}
                </motion.p>
              )}
            </div>

            <button
              onClick={handleSpin}
              disabled={spinning || !spinAvailable}
              className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.96] ${
                spinAvailable ? 'btn-primary' : 'bg-xena-surface text-xena-muted'
              }`}
            >
              {spinning ? 'Çevriliyor...' : spinAvailable ? 'ÇEVİR' : 'Hakkın Yok'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
