import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Star, Package, Zap, Trophy, Diamond } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContent } from '../context/ContentContext';
import { useWallet } from '../context/WalletContext';
import TopBar from '../components/TopBar';

const CATEGORIES = [
  { key: 'hepsi', label: 'Hepsi' },
  { key: 'paket', label: 'Coin Paketi' },
  { key: 'emote', label: 'Emote' },
  { key: 'avatar', label: 'Avatar' },
  { key: 'rozet', label: 'Rozet' },
  { key: 'efekt', label: 'Efekt' },
  { key: 'ozel', label: 'Özel' },
];

const CAT_ICONS: Record<string, React.ReactNode> = {
  hepsi: <Shield size={14} />,
  paket: <Diamond size={14} />,
  emote: <Star size={14} />,
  avatar: <Package size={14} />,
  rozet: <Trophy size={14} />,
  efekt: <Zap size={14} />,
  ozel: <Shield size={14} />,
};

export default function MarketPage() {
  const { currentUser, isLoggedIn } = useAuth();
  const { market } = useContent();
  const products = market.map((p: any) => ({ ...p, priceAltin: p.price, coinsAmount: p.category === 'paket' ? parseInt(String(p.description).replace(/\\D/g, '')) || 0 : 0 }));
  const { getWallet, purchaseCoins, addCoins } = useWallet();
  const [filter, setFilter] = useState('hepsi');

  const wallet = currentUser ? getWallet(currentUser.id) : null;
  const altinBalance = wallet?.balance ?? 0;
  const coinsBalance = wallet?.coinsBalance ?? 0;

  const activeProducts = products.filter((p) => p.active);
  const filtered = filter === 'hepsi' ? activeProducts : activeProducts.filter((p) => p.category === filter);

  const handleBuy = (product: (typeof products)[0]) => {
    if (!isLoggedIn || !currentUser) {
      alert('Giriş Gerekli - Satın almak için giriş yapmalısın.');
      return;
    }
    const isCoinsPackage = product.coinsAmount > 0;
    if (isCoinsPackage) {
      if (altinBalance < product.priceAltin) {
        alert(`Yetersiz Altın - Bu paket için ${product.priceAltin} altın gerekiyor.`);
        return;
      }
      if (confirm(`${product.priceAltin} altın harcayarak ${product.coinsAmount} Coins almak istiyor musun?`)) {
        purchaseCoins(currentUser.id, product.priceAltin, product.coinsAmount, product.name);
        alert(`${product.coinsAmount} Coins cüzdanına eklendi!`);
      }
    } else {
      if (altinBalance < product.priceAltin) {
        alert(`Yetersiz Altın - Bu ürün için ${product.priceAltin} altın gerekiyor.`);
        return;
      }
      if (confirm(`${product.name} satın almak istiyor musun?`)) {
        addCoins(currentUser.id, -product.priceAltin, `Market: ${product.name}`);
        alert(`${product.name} başarıyla satın alındı!`);
      }
    }
  };

  return (
    <div className="min-h-dvh bg-xena-bg pb-20">
      <TopBar />
      <div className="px-4 pt-3 pb-2 safe-top">
        <h1 className="text-2xl font-extrabold text-white">Market</h1>
        <p className="text-[13px] text-xena-muted mt-0.5">Altın ile ürün ve Coins satın al</p>
      </div>

      {/* Balance Cards */}
      <div className="px-4 mb-3">
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-2xl p-3 border border-yellow-500/20 bg-yellow-500/10">
            <span className="text-[10px] font-bold text-white/50 tracking-wider">Altın</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-lg">🪙</span>
              <span className="text-2xl font-black text-yellow-400">{altinBalance.toLocaleString('tr-TR')}</span>
            </div>
            <span className="text-[10px] text-white/40">çarktan kazan</span>
          </div>
          <div className="flex-1 rounded-2xl p-3 border border-xena-primary/20 bg-xena-primary/10">
            <span className="text-[10px] font-bold text-white/50 tracking-wider">Coins</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-lg">💎</span>
              <span className="text-2xl font-black text-xena-accent">{coinsBalance.toLocaleString('tr-TR')}</span>
            </div>
            <span className="text-[10px] text-white/40">marketten al</span>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 ${
                filter === cat.key ? 'bg-xena-primary text-white' : 'bg-xena-surface text-xena-muted'
              }`}
            >
              {CAT_ICONS[cat.key]} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="text-xena-muted mx-auto mb-3" />
            <p className="text-xena-muted">Bu kategoride ürün yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {filtered.map((product) => {
              const canAfford = altinBalance >= product.priceAltin;
              const isCoins = product.coinsAmount > 0;
              return (
                <motion.div
                  key={product.id}
                  whileTap={{ scale: 0.96 }}
                  className="card p-3 relative overflow-hidden"
                >
                  {product.limited && <span className="absolute top-2 right-2 text-[8px] font-extrabold bg-xena-danger text-white px-1.5 py-0.5 rounded">SINIRLI</span>}
                  {product.hot && !product.limited && <span className="absolute top-2 right-2 text-[8px] font-extrabold bg-orange-500 text-white px-1.5 py-0.5 rounded">🔥 POPÜLER</span>}
                  <div className="w-14 h-14 rounded-[15px] flex items-center justify-center text-2xl border mb-2" style={{ background: `${product.color}22`, borderColor: `${product.color}44` }}>
                    <Diamond size={24} style={{ color: product.color }} />
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 mb-0.5">{product.name}</h4>
                  <p className="text-[10px] text-xena-muted line-clamp-2 mb-1.5">{product.description}</p>
                  {isCoins && (
                    <div className="bg-xena-primary/20 rounded-lg px-2 py-0.5 w-fit mb-1.5">
                      <span className="text-[11px] font-extrabold text-xena-accent">💎{product.coinsAmount} Coins</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      <span className="text-sm">🪙</span>
                      <span className={`text-sm font-extrabold ${canAfford ? 'text-yellow-400' : 'text-xena-muted'}`}>{product.priceAltin}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(product)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all active:scale-95 ${
                        canAfford ? 'bg-xena-primary text-white' : 'bg-xena-surface text-xena-muted'
                      }`}
                    >
                      {canAfford ? 'Al' : 'Yetersiz'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="card flex items-start gap-3 p-3.5 mt-4 mb-6">
          <span className="text-xl shrink-0">💡</span>
          <div>
            <h4 className="text-sm font-bold text-white">Nasıl çalışır?</h4>
            <p className="text-xs text-xena-muted leading-relaxed mt-0.5">
              Şans çarkından kazandığın <span className="text-yellow-400">Altın 🪙</span> ile ürün veya <span className="text-xena-accent">Coins 💎</span> satın alabilirsin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

