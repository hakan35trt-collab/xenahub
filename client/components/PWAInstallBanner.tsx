import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, ChevronRight } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export default function PWAInstallBanner() {
  const { isInstallable, promptInstall, dismissInstall, shouldShowPrompt, isInstalled, isStandalone } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
  }, []);

  if (dismissed || !shouldShowPrompt() || (!isInstallable && !isIOS) || isStandalone || isInstalled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-0 right-0 z-[90] px-4"
      >
        <div className="max-w-md mx-auto glass rounded-2xl p-5 border border-xena-primary/20 shadow-glass">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-xena-primary/15 flex items-center justify-center shrink-0">
              <Smartphone size={22} className="text-xena-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">XENAHUB'ı Yükle</h3>
              <p className="text-xs text-xena-muted mt-0.5">
                {isIOS
                  ? 'Ana ekrana ekleyin. Paylaş tuşuna basın ve "Ana Ekrana Ekle" seçeneğini seçin.'
                  : 'APK gibi çalışsın. Yükleyin ve hemen kullanın.'}
              </p>
              <div className="flex items-center gap-2 mt-3">
                {isInstallable && (
                  <button
                    onClick={promptInstall}
                    className="flex items-center gap-1 btn-primary px-4 py-2 rounded-full text-xs font-bold active:scale-95"
                  >
                    <Download size={14} />
                    Yükle
                  </button>
                )}
                <button
                  onClick={() => { dismissInstall(); setDismissed(true); }}
                  className="text-xs text-xena-muted hover:text-white font-semibold px-3 py-2"
                >
                  Sonra
                </button>
              </div>
            </div>
            <button
              onClick={() => { dismissInstall(); setDismissed(true); }}
              className="text-xena-muted hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
