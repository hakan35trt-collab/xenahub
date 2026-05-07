import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppContextValue {
  isMobile: boolean;
  isStandalone: boolean;
  showInstallBanner: boolean;
  setShowInstallBanner: (v: boolean) => void;
  showUpdateBanner: boolean;
  setShowUpdateBanner: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
      setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <AppContext.Provider value={{
      isMobile,
      isStandalone,
      showInstallBanner,
      setShowInstallBanner,
      showUpdateBanner,
      setShowUpdateBanner,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export default AppContext;
