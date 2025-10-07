"use client";

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LocalStorage } from '../lib/storage';
import { Cherry, Grape, Citrus, DollarSign, Sparkles, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SYMBOLS = [
  { id: 'cherry', icon: Cherry, color: 'text-red-500', weight: 40 },
  { id: 'lemon', icon: Citrus, color: 'text-yellow-400', weight: 30 },
  { id: 'grape', icon: Grape, color: 'text-purple-500', weight: 20 },
  { id: 'dollar', icon: DollarSign, color: 'text-green-400', weight: 10 },
];
const PAYOUTS = { cherry: 2, lemon: 3, grape: 5, dollar: 10 };

const Reel = ({ finalSymbolId, isSpinning }: { finalSymbolId: string; isSpinning: boolean; }) => {
    const symbolsToRender = isSpinning ? SYMBOLS : [SYMBOLS.find(s => s.id === finalSymbolId)!];
    
    return (
        <div className="h-28 overflow-hidden bg-slate-900/80 rounded-xl flex items-center justify-center relative border-2 border-slate-700">
            <motion.div
                animate={{ y: isSpinning ? ['0%', '-100%'] : '0%' }}
                transition={isSpinning ? { duration: 0.15, repeat: Infinity, ease: 'linear' } : { duration: 0.5, ease: 'easeOut' }}
            >
                {SYMBOLS.map(s => {
                    const Icon = s.icon;
                    return <div key={s.id} className="h-28 flex items-center justify-center"><Icon size={64} className={s.color} strokeWidth={2.5} /></div>
                })}
            </motion.div>
            
            <AnimatePresence>
                {!isSpinning && (
                     <motion.div 
                        key={finalSymbolId}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute"
                     >
                        {(() => {
                            const Icon = SYMBOLS.find(s => s.id === finalSymbolId)!.icon;
                            const color = SYMBOLS.find(s => s.id === finalSymbolId)!.color;
                            return <Icon size={64} className={color} strokeWidth={2.5} />;
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SlotMachine = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth();
  const [reels, setReels] = useState(['cherry', 'lemon', 'grape']);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [message, setMessage] = useState('');
  const [lastWin, setLastWin] = useState(0);

  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
    let random = Math.random() * totalWeight;
    for (const symbol of SYMBOLS) {
      random -= symbol.weight;
      if (random <= 0) return symbol.id;
    }
    return SYMBOLS[0].id;
  };

  const spin = async () => {
    if (!profile || spinning) return;
    if (betAmount > profile.balance) {
      setMessage('Insufficient balance!');
      return;
    }
    if (betAmount < 1) {
      setMessage('Minimum bet is 1 credit');
      return;
    }

    setSpinning(true);
    setMessage('');
    setLastWin(0);

    const spinDuration = 2000;
    setTimeout(async () => {
      const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      setReels(finalReels);
      setSpinning(false);

      const allSame = finalReels.every(symbol => symbol === finalReels[0]);
      let payout = 0;

      if (allSame) {
        const multiplier = PAYOUTS[finalReels[0] as keyof typeof PAYOUTS];
        payout = betAmount * multiplier;
        setLastWin(payout);
        setMessage(`WIN! ${multiplier}x payout!`);
      } else {
        setMessage('Try again!');
      }

      const newBalance = profile.balance - betAmount + payout;
      await LocalStorage.updateProfile(profile.id, {
        balance: newBalance,
        total_wagered: profile.total_wagered + betAmount,
        total_won: profile.total_won + payout,
      });
      await LocalStorage.addGameHistory({
        user_id: profile.id,
        game_type: 'slots',
        bet_amount: betAmount,
        payout_amount: payout,
        game_data: { reels: finalReels },
      });
      refreshProfile();
    }, spinDuration);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Lobby
        </button>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-2">
              <Sparkles size={32} /> Slot Machine
            </h2>
            <p className="text-slate-400">Match 3 symbols to win!</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl p-8 mb-8 border-4 border-amber-500/30">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Reel finalSymbolId={reels[0]} isSpinning={spinning} />
              <Reel finalSymbolId={reels[1]} isSpinning={spinning} />
              <Reel finalSymbolId={reels[2]} isSpinning={spinning} />
            </div>

            {message && ( <div className="text-center text-xl font-bold py-2">{message}</div> )}
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-slate-300 mb-2">Bet Amount: {betAmount} credits</label>
              <input type="range" min="1" max={Math.min(100, profile?.balance || 0)} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={spinning} className="w-full ... accent-amber-500"/>
            </div>
            <button onClick={spin} disabled={spinning || !profile || betAmount > (profile?.balance || 0)} className="w-full ...">
              {spinning ? 'SPINNING...' : 'SPIN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};