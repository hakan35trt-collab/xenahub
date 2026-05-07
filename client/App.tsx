import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { ContentProvider } from './context/ContentContext';
import { MarketProvider } from './context/MarketContext';
import { WalletProvider } from './context/WalletContext';
import { WheelProvider } from './context/WheelContext';
import { NotificationProvider } from './context/NotificationContext';
import { SupportProvider } from './context/SupportContext';
import { ChatProvider } from './context/ChatContext';
import { useApp } from './context/AppContext';

const LandingPage = lazy(() => import('./components/LandingPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const HaberlerPage = lazy(() => import('./pages/HaberlerPage'));
const EtkinliklerPage = lazy(() => import('./pages/EtkinliklerPage'));
const MarketPage = lazy(() => import('./pages/MarketPage'));
const DestekPage = lazy(() => import('./pages/DestekPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const Layout = lazy(() => import('./components/Layout'));
const PWAInstallBanner = lazy(() => import('./components/PWAInstallBanner'));
const UpdateBanner = lazy(() => import('./components/UpdateBanner'));
const ChatBubble = lazy(() => import('./components/ChatBubble'));
const SplashScreen = lazy(() => import('./components/SplashScreen'));

function Router() {
  const { isMobile, isStandalone } = useApp();
  const forceApp = new URLSearchParams(window.location.search).get('app') === '1';
  const showApp = isMobile || isStandalone || forceApp;

  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 600);
    }
  }, []);

  if (!showApp) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-xena-bg flex items-center justify-center"><div className="animate-pulse text-xena-primary font-bold text-xl">XENAHUB</div></div>}>
        <LandingPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-dvh bg-xena-bg" />}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/haberler" element={<HaberlerPage />} />
          <Route path="/etkinlikler" element={<EtkinliklerPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/destek" element={<DestekPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Suspense>
  );
}

function InstallOverlays() {
  return (
    <Suspense fallback={null}>
      <PWAInstallBanner />
      <UpdateBanner />
      <ChatBubble />
    </Suspense>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <ContentProvider>
          <NotificationProvider>
            <WalletProvider>
              <MarketProvider>
                <WheelProvider>
                  <SupportProvider>
                    <ChatProvider>
                      <BrowserRouter>
                        <SplashScreen />
                        <InstallOverlays />
                        <Router />
                      </BrowserRouter>
                    </ChatProvider>
                  </SupportProvider>
                </WheelProvider>
              </MarketProvider>
            </WalletProvider>
          </NotificationProvider>
        </ContentProvider>
      </AuthProvider>
    </AppProvider>
  );
}
