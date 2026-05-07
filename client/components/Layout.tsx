import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Calendar, FileText, ShoppingBag, LifeBuoy } from 'lucide-react';

const tabs = [
  { path: '/', label: 'ANASAYFA', icon: Home },
  { path: '/etkinlikler', label: 'Etkinlikler', icon: Calendar },
  { path: '/haberler', label: 'Haberler', icon: FileText },
  { path: '/market', label: 'Market', icon: ShoppingBag },
  { path: '/destek', label: 'Destek', icon: LifeBuoy },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-dvh bg-xena-bg flex flex-col">
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/[0.06] safe-bottom">
        <div className="max-w-md mx-auto flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
              >
                <motion.div
                  className={`p-2 rounded-xl ${isActive ? 'bg-xena-primary/20' : ''}`}
                  whileTap={{ scale: 0.85 }}
                >
                  <Icon
                    size={22}
                    className={isActive ? 'text-xena-primary' : 'text-xena-muted'}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </motion.div>
                <span
                  className={`text-[9px] font-bold tracking-wide ${
                    isActive ? 'text-xena-primary' : 'text-xena-muted'
                  }`}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-1 w-6 h-0.5 bg-xena-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
