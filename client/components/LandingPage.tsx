import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, Smartphone, Star, Trophy, Users, Zap, Monitor, Shield,
  Crown, Globe, Rocket, ChevronRight, QrCode, ArrowRight, Share,
  Info, CheckCircle
} from 'lucide-react';

/* ========== Global PWA Hook ========== */
declare global {
  interface Window {
    __deferredPrompt: any | null;
    __pwaInstallable: boolean;
    __pwaInstalled: boolean;
  }
}

function usePWAGlobal() {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const check = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
      setInstalled(standalone || window.__pwaInstalled);
      setInstallable(window.__pwaInstallable && !standalone);
    };
    check();
    const onInstallable = () => { setInstallable(true); };
    const onInstalled = () => { setInstalled(true); setInstallable(false); };
    window.addEventListener('pwa:installable' as any, onInstallable);
    window.addEventListener('pwa:installed' as any, onInstalled);
    return () => {
      window.removeEventListener('pwa:installable' as any, onInstallable);
      window.removeEventListener('pwa:installed' as any, onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    const e = window.__deferredPrompt;
    if (!e) return false;
    try {
      await e.prompt();
      const result = await e.userChoice;
      if (result.outcome === 'accepted') {
        window.__pwaInstalled = true; window.__pwaInstallable = false; window.__deferredPrompt = null;
        setInstalled(true); setInstallable(false);
      }
      return result.outcome === 'accepted';
    } catch { return false; }
  }, []);

  return { installable, installed, isStandalone, promptInstall };
}

function useOS() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const android = /Android/.test(ua);
    const desktop = !ios && !android;
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsIOS(ios); setIsAndroid(android); setIsDesktop(desktop); setIsStandalone(standalone);
  }, []);

  return { isIOS, isAndroid, isDesktop, isMobile: isIOS || isAndroid, isStandalone };
}

/* ========== Modals ========== */
function IOSGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-6 border border-xena-primary/20 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center mb-5">
          <Share size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Ana Ekrana Ekle</h3>
        <p className="text-sm text-xena-muted mb-6">iPhone&apos;unuzda XENAHUB&apos;i uygulama gibi eklemek icin:</p>
        <div className="space-y-4 text-left">
          {[
            { step: '1', title: 'Paylas (kutu+ok) tusuna basin', desc: 'En altta ortadaki buton' },
            { step: '2', title: '"Ana Ekrana Ekle" secenegini bulun', desc: 'Menude asagi kaydirin' },
            { step: '3', title: '"Ekle" tusuna basin', desc: 'Ana ekraniniza simge gelsin!' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3 bg-white/[0.03] rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-xena-primary/15 flex items-center justify-center shrink-0 font-bold text-xena-primary">{s.step}</div>
              <div>
                <p className="text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-xena-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full bg-xena-primary text-white font-bold py-3 rounded-2xl active:scale-95 transition-all">Anladim</button>
      </motion.div>
    </div>
  );
}

function DesktopGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-3xl p-6 border border-xena-primary/20 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center mb-5">
          <Smartphone size={28} className="text-white" />
        </div>
        <h3 className="text-xl font-bold mb-2">Telefonunuzda Deneyin</h3>
        <p className="text-sm text-xena-muted mb-6">XENAHUB mobilde tam bir uygulama deneyimi sunar.</p>
        <div className="bg-white/[0.03] rounded-2xl p-4 mb-4">
          <p className="text-xs text-xena-muted uppercase tracking-widest mb-2">Web Adresi</p>
          <div className="flex items-center justify-center gap-2 bg-black/30 rounded-xl px-4 py-3">
            <Globe size={16} className="text-xena-primary" />
            <span className="text-lg font-bold text-white select-all">xenahub.online</span>
          </div>
        </div>
        <a href="/?app=1" className="block w-full bg-gradient-to-r from-xena-primary to-xena-accent text-white font-bold py-3 rounded-2xl active:scale-95 transition-all mb-3">
          PC&apos;de Uygulama Modunu Ac
        </a>
        <button onClick={onClose} className="text-sm text-xena-muted hover:text-white font-semibold">Vazgec</button>
      </motion.div>
    </div>
  );
}

/* ========== Main Landing ========== */
export default function LandingPage() {
  const [showQR, setShowQR] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [showDesktop, setShowDesktop] = useState(false);
  const { installable, installed, isStandalone, promptInstall } = usePWAGlobal();
  const { isIOS, isAndroid, isDesktop } = useOS();

  const already = isStandalone || installed;

  const handleInstallOrOpen = () => {
    if (already) { window.location.href = '/'; return; }
    if (installable) { promptInstall(); return; }
    if (isIOS) { setShowIOS(true); return; }
    setShowDesktop(true);
  };

  const handleNavOpen = () => {
    if (already) { window.location.reload(); return; }
    window.location.href = '/?app=1';
  };

  return (
    <div className="min-h-dvh bg-xena-bg text-white overflow-x-hidden relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[radial-gradient(ellipse,rgba(145,71,255,0.08)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(255,0,128,0.05)_0%,transparent_60%)]" />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-3xl p-8 border border-xena-primary/20 text-center max-w-sm mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Telefonunuzda Acin</h3>
              <p className="text-sm text-xena-muted mb-4">xenahub.online adresini ziyaret edin</p>
              <div className="w-48 h-48 mx-auto bg-white rounded-2xl p-3">
                <div className="w-full h-full bg-xena-bg rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 border-2 border-xena-primary rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-black text-xena-primary">X</span>
                    </div>
                    <p className="text-[10px] text-xena-muted">xenahub.online</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showIOS && <IOSGuide onClose={() => setShowIOS(false)} />}
      {showDesktop && <DesktopGuide onClose={() => setShowDesktop(false)} />}

      {/* Navbar */}
      <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6 backdrop-blur-md border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center shadow-neon">
            <span className="text-lg font-black text-white">X</span>
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-black tracking-wider">XENAHUB</span>
            <span className="block text-[10px] text-xena-muted font-medium tracking-widest uppercase">by ModClub Ajans</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowQR(!showQR)} className="hidden md:flex items-center gap-2 text-sm font-semibold text-xena-muted hover:text-white transition-colors">
            <QrCode size={16} /><span>QR ile Ac</span>
          </button>
          <button onClick={handleNavOpen} className="flex items-center gap-2 bg-xena-primary hover:bg-xena-primary/80 text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-neon active:scale-95 transition-all">
            <Smartphone size={16} />
            <span className="hidden sm:inline">Uygulamayi Ac</span>
            <span className="sm:hidden">Ac</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 bg-xena-primary/10 border border-xena-primary/25 text-xena-primary text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Rocket size={14} /><span>Turkiye&apos;nin #1 Yayinci Platformu</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
            <span className="text-white">XENAHUB</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-xena-primary via-xena-accent to-xena-primary">CEO</span>
            <br />
            <span className="text-3xl md:text-4xl font-bold text-xena-muted">by ModClub Ajans</span>
          </h1>
          <p className="text-lg md:text-xl text-xena-muted mt-8 max-w-xl leading-relaxed">
            Canli yayin dunyasinin merkezi. Turnuvalar, etkinlikler, sohbet ve cok daha fazlasi. APK gibi kur, tarayicida calissin.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-10">
            <button onClick={handleInstallOrOpen} className="group flex items-center gap-3 bg-gradient-to-r from-xena-primary to-xena-accent text-white font-bold px-8 py-4 rounded-2xl shadow-neon active:scale-95 transition-all text-lg">
              {already ? (
                <><CheckCircle size={22} /><div className="leading-tight text-left"><div className="text-xs opacity-80">Yuklu</div><div>Uygulamayi Ac</div></div></>
              ) : isAndroid ? (
                <><Download size={22} className="group-hover:animate-bounce" /><div className="leading-tight text-left"><div className="text-xs opacity-80">APK gibi</div><div>Simdi Yuekle</div></div></>
              ) : isIOS ? (
                <><Share size={22} /><div className="leading-tight text-left"><div className="text-xs opacity-80">Ana Ekrana Ekle</div><div>Yuekle</div></div></>
              ) : (
                <><Download size={22} className="group-hover:animate-bounce" /><div className="leading-tight text-left"><div className="text-xs opacity-80">Uecretsiz</div><div>Hemen Indir</div></div></>
              )}
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center gap-2 text-xena-muted hover:text-white font-semibold px-6 py-4 rounded-2xl border border-white/[0.08] hover:border-white/[0.2] transition-all active:scale-95">
              Kesfet<ArrowRight size={18} />
            </button>
          </div>

          {!already && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-6 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-xena-muted bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.06]">
                <Info size={13} className="text-xena-primary" />
                {isAndroid ? 'Chrome "Ana Ekrana Ekle" popupi gelecek' : isIOS ? 'Safari paylas menusunden ekleyin' : 'Chrome/Edge/Brave tarayicilardan yukleyebilirsiniz'}
              </span>
            </motion.div>
          )}

          <div className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-3">
              {['X','E','N','A'].map((c,i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-xena-surface to-xena-bg border-2 border-xena-bg flex items-center justify-center text-xs font-bold text-xena-primary">{c}</div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />)}
                <span className="text-sm font-bold ml-1">4.9</span>
              </div>
              <p className="text-sm text-xena-muted">2,847 aktif kullanici</p>
            </div>
          </div>
        </motion.div>

        {/* Phone Mockup */}
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.3 }} className="hidden lg:flex justify-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-r from-xena-primary/20 to-xena-accent/20 rounded-[60px] blur-3xl" />
            <div className="relative w-[300px] h-[620px] bg-gradient-to-b from-xena-surface to-xena-bg rounded-[48px] border-[3px] border-white/[0.08] shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-xena-bg rounded-b-3xl z-20 flex items-center justify-center"><div className="w-16 h-1 bg-white/10 rounded-full" /></div>
              <div className="h-full pt-10 px-5 space-y-4 overflow-hidden">
                <div className="flex items-center justify-between"><div className="text-sm font-bold">XENAHUB</div><div className="w-8 h-8 rounded-full bg-xena-primary/20" /></div>
                <div className="h-32 bg-gradient-to-br from-xena-primary/40 to-xena-accent/20 rounded-3xl flex items-end p-4">
                  <div><div className="text-[10px] font-bold uppercase tracking-wider text-xena-primary mb-1">CEO Panel</div><div className="text-sm font-bold">ModClub Ajans</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Yayinci','Turnuva','Sohbet'].map((l,i) => (
                    <div key={i} className="bg-white/[0.03] rounded-2xl p-3 text-center">
                      <div className="text-lg font-black text-xena-primary">{i===0?'2K':i===1?'48':'12K'}</div>
                      <div className="text-[9px] text-xena-muted">{l}</div>
                    </div>
                  ))}
                </div>
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3 bg-white/[0.02] rounded-2xl p-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xena-primary/20 to-xena-accent/10 flex items-center justify-center text-xs font-bold">{i}</div>
                    <div className="flex-1 space-y-1">
                      <div className="h-2.5 bg-white/10 rounded w-3/4" />
                      <div className="h-2 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Bar */}
      <div className="relative z-10 border-y border-white/[0.04] bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '2,847+', label: 'Aktif Kullanici', icon: Users },
            { value: '150+', label: 'Canli Yayinci', icon: Globe },
            { value: '48', label: 'Aktif Turnuva', icon: Trophy },
            { value: '99.9%', label: 'Uptime', icon: Shield },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <stat.icon size={18} className="text-xena-primary" />
                <span className="text-2xl md:text-3xl font-black text-white">{stat.value}</span>
              </div>
              <p className="text-sm text-xena-muted">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <motion.span initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-xena-primary text-sm font-bold tracking-widest uppercase">Ozellikler</motion.span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black mt-3">Neden <span className="text-xena-primary">XENAHUB</span>?</motion.h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Trophy, title: 'Turnuvalar', desc: 'Haftalik ve aylik turnuvalarla buyuk oduller kazanin.' },
            { icon: Users, title: 'Canli Topluluk', desc: 'Binlerce yayinci ve izleyiciyle gercek zamanli sohbet edin.' },
            { icon: Smartphone, title: 'PWA Uygulama', desc: 'Tarayiciniza yukleyin. APK gibi calissin.' },
            { icon: Zap, title: 'Ultra Hizli', desc: '60fps animasyonlar, optimize edilmis cache.' },
            { icon: Crown, title: 'Premium Deneyim', desc: 'Cam efektleri, neon temalar, akici gecisler.' },
            { icon: Monitor, title: 'Her Cihazda', desc: 'Telefon, tablet ve masaustunde kusursuz uyum.' },
          ].map((feat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }} className="group glass rounded-3xl p-7 hover:bg-white/[0.05] transition-all duration-300 border border-white/[0.04] hover:border-xena-primary/20 cursor-default">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-xena-primary/20 to-xena-accent/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <feat.icon size={24} className="text-xena-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-xena-muted leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Install CTA */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-xena-primary/20 via-xena-bg to-xena-accent/10 border border-xena-primary/20 p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(145,71,255,0.15)_0%,transparent_70%)]" />
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center shadow-neon mb-8">
              <Download size={32} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4">Simdi Yuekleyin</h2>
            <p className="text-xena-muted text-lg max-w-xl mx-auto mb-10">
              Tarayiciniza yukleyin, ana ekraniniza ekleyin. APK gibi calisan uygulama. Uecretsiz.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={handleInstallOrOpen} className="group flex items-center gap-3 bg-gradient-to-r from-xena-primary to-xena-accent text-white font-bold px-10 py-5 rounded-2xl shadow-neon active:scale-95 transition-all text-lg">
                {already ? (
                  <><CheckCircle size={24} /><span>Uygulamayi Ac</span></>
                ) : isAndroid ? (
                  <><Download size={24} className="group-hover:animate-bounce" /><span>Simdi Yuekle</span></>
                ) : isIOS ? (
                  <><Share size={24} /><span>Ana Ekrana Ekle</span></>
                ) : (
                  <><Download size={24} className="group-hover:animate-bounce" /><span>Tarayiciya Yuekle</span></>
                )}
              </button>
              <div className="flex items-center gap-2 text-sm text-xena-muted bg-white/[0.03] px-5 py-3 rounded-2xl border border-white/[0.06]">
                <Globe size={16} className="text-xena-primary" />
                <span>xenahub.online</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-xena-primary to-xena-accent flex items-center justify-center shadow-neon">
                  <span className="text-lg font-black text-white">X</span>
                </div>
                <div>
                  <div className="text-lg font-black">XENAHUB</div>
                  <div className="text-[10px] text-xena-muted tracking-widest uppercase">by ModClub Ajans</div>
                </div>
              </div>
              <p className="text-sm text-xena-muted max-w-sm leading-relaxed">
                Turkiye&apos;nin onde gelen yayinci platformu. Canli yayinlar, turnuvalar, etkinlikler ve topluluk.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Platform</h4>
              <ul className="space-y-3 text-sm text-xena-muted">
                <li><a href="?app=1" className="hover:text-white transition-colors">Uygulamayi Ac</a></li>
                <li><a href="/haberler" className="hover:text-white transition-colors">Haberler</a></li>
                <li><a href="/etkinlikler" className="hover:text-white transition-colors">Etkinlikler</a></li>
                <li><a href="/market" className="hover:text-white transition-colors">Market</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-sm">Kurumsal</h4>
              <ul className="space-y-3 text-sm text-xena-muted">
                <li><span className="text-xena-primary font-semibold">XENAHUB CEO</span></li>
                <li>ModClub Ajans</li>
                <li>xenahub.online</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/[0.06] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-xena-muted"> XENAHUB by ModClub Ajans. Tum haklari saklidir.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
