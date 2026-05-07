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

// Preload critical pages
import Layout from './components/Layout';
import HomePage from './pages/HomePage';

const LandingPage = lazy(() => import('./components/LandingPage'));
const HaberlerPage = lazy(() => import('./pages/HaberlerPage'));
const EtkinliklerPage = lazy(() => import('./pages/EtkinliklerPage'));
const MarketPage = lazy(() => import('./pages/MarketPage'));
const DestekPage = lazy(() => import('./pages/DestekPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const PWAInstallBanner = lazy(() => import('./components/PWAInstallBanner'));
const UpdateBanner = lazy(() => import('./components/UpdateBanner'));
const ChatBubble = lazy(() => import('./components/ChatBubble'));
const SplashScreen = lazy(() => import('./components/SplashScreen'));

// Simple fallback that doesn't cause flash
function PageFallback() {
  return <div className="min-h-dvh bg-xena-bg" />;
}

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
      <Suspense fallback={<PageFallback />}>
        <LandingPage />
      </Suspense>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/haberler" element={<Suspense fallback={<PageFallback />}><HaberlerPage /></Suspense>} />
        <Route path="/etkinlikler" element={<Suspense fallback={<PageFallback />}><EtkinliklerPage /></Suspense>} />
        <Route path="/market" element={<Suspense fallback={<PageFallback />}><MarketPage /></Suspense>} />
        <Route path="/destek" element={<Suspense fallback={<PageFallback />}><DestekPage /></Suspense>} />
        <Route path="/admin" element={<Suspense fallback={<PageFallback />}><AdminPage /></Suspense>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
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
