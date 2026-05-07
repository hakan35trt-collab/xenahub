import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function UpdateBanner() {
  const { updateAvailable, reloadForUpdate } = usePWA();

  if (!updateAvailable) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4 safe-top"
      >
        <div className="max-w-md mx-auto glass rounded-2xl px-4 py-3 border border-xena-primary/20 shadow-glass flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-xena-primary/15 flex items-center justify-center shrink-0">
            <RefreshCw size={14} className="text-xena-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white">Güncelleme Mevcut</h4>
            <p className="text-xs text-xena-muted">Yeni bir sürüm yayınlandı.</p>
          </div>
          <button
            onClick={reloadForUpdate}
            className="flex items-center gap-1 btn-primary px-4 py-2 rounded-full text-xs font-bold active:scale-95"
          >
            Yenile
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
