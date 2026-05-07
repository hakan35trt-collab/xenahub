import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Star, Trophy, Users, Zap, Monitor, Shield, Crown } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-xena-bg text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,rgba(145,71,255,0.06)_0%,transparent_60%)]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-1">
          <span className="text-xl font-black tracking-wider">MOD</span>
          <span className="text-xl font-black text-xena-primary tracking-wider">CLUB</span>
        </div>
        <a
          href="/"
          className="text-sm font-semibold text-white bg-xena-primary/20 border border-xena-primary/40 px-5 py-2.5 rounded-full hover:bg-xena-primary/30 transition-all active:scale-95"
        >
          Mobil Uygulamayı Aç
        </a>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 bg-xena-primary/15 border border-xena-primary/30 text-xena-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5">
            <Zap size={14} /> Şimdi Yükleyin
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">
            Türkiye&apos;nin<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-xena-primary to-xena-accent">Yayıncı Platformu</span>
          </h1>
          <p className="text-base md:text-lg text-xena-muted mt-5 max-w-lg leading-relaxed">
            Canlı yayınlar, turnuvalar, etkinlikler ve çok daha fazlası. Telefonunuza kurun, APK gibi çalışsın.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <a href="/" className="flex items-center gap-2 bg-xena-primary text-white font-bold px-6 py-3 rounded-xl shadow-neon active:scale-95 transition-all">
              <Smartphone size={20} />
              Mobil Uygulamayı Aç
            </a>
          </div>
          <div className="flex items-center gap-6 pt-8">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-xena-surface border-2 border-xena-bg flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-xena-muted">2,000+ aktif kullanıcı</p>
          </div>
        </motion.div>

        {/* Phone Mockup */}
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden lg:flex justify-center">
          <div className="relative w-[280px] h-[560px] bg-xena-bg rounded-[40px] border-4 border-xena-surface shadow-glass overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-xena-surface rounded-b-2xl z-10" />
            <div className="h-full bg-xena-bg p-4 pt-10 space-y-4">
              <div className="h-8 bg-xena-surface rounded-xl" />
              <div className="h-28 bg-gradient-to-br from-xena-primary/30 to-transparent rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-xena-surface rounded w-3/4" />
                <div className="h-4 bg-xena-surface rounded w-1/2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-20 bg-xena-surface rounded-xl" />
                <div className="h-20 bg-xena-surface rounded-xl" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold">Neden XENAHUB?</h2>
          <p className="text-xena-muted mt-2">Türkiye&apos;nin en büyük yayıncı topluluğu</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Trophy, title: 'Turnuvalar', desc: 'Haftalık ve aylık turnuvalarla ödüller kazanın' },
            { icon: Users, title: 'Topluluk', desc: 'Binlerce yayıncı ve izleyiciyle bağlantı kurun' },
            { icon: Smartphone, title: 'PWA Uygulama', desc: 'Tarayıcıya kurun, APK gibi çalışsın' },
            { icon: Zap, title: 'Hızlı', desc: 'Optimize edilmiş, 60fps performans' },
            { icon: Monitor, title: 'Her Cihazda', desc: 'Telefon, tablet ve masaüstünde kusursuz' },
            { icon: Crown, title: 'Premium', desc: 'Şeffaf cam efektleri ve neon temalar' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:bg-white/[0.06] transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-xena-primary/15 flex items-center justify-center mb-4">
                <feat.icon size={22} className="text-xena-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-xena-muted leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="glass rounded-3xl p-8 md:p-12 border border-xena-primary/20 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Şimdi Yükleyin</h2>
          <p className="text-xena-muted mb-8 max-w-lg mx-auto">
            Tarayıcınıza yükleyin, anında APK gibi kullanın. Yükleme ücretsiz ve sadece saniyeler sürer.
          </p>
          <a href="/" className="inline-flex items-center gap-2 bg-xena-primary text-white font-bold px-8 py-4 rounded-xl shadow-neon active:scale-95 transition-all text-lg">
            <Download size={22} />
            XENAHUB&apos;ı Aç
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 text-center">
        <p className="text-xs text-xena-muted">XENAHUB 2026. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}
