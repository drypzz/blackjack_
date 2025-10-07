"use client";

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LocalStorage } from '../lib/storage';
import { CircleDot, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ROULETTE_NUMBERS = [
  { num: 0, color: 'green' }, { num: 32, color: 'red' }, { num: 15, color: 'black' },
  { num: 19, color: 'red' }, { num: 4, color: 'black' }, { num: 21, color: 'red' },
  { num: 2, color: 'black' }, { num: 25, color: 'red' }, { num: 17, color: 'black' },
  { num: 34, color: 'red' }, { num: 6, color: 'black' }, { num: 27, color: 'red' },
  { num: 13, color: 'black' }, { num: 36, color: 'red' }, { num: 11, color: 'black' },
  { num: 30, color: 'red' }, { num: 8, color: 'black' }, { num: 23, color: 'red' },
  { num: 10, color: 'black' }, { num: 5, color: 'red' }, { num: 24, color: 'black' },
  { num: 16, color: 'red' }, { num: 33, color: 'black' }, { num: 1, color: 'red' },
  { num: 20, color: 'black' }, { num: 14, color: 'red' }, { num: 31, color: 'black' },
  { num: 9, color: 'red' }, { num: 22, color: 'black' }, { num: 18, color: 'red' },
  { num: 29, color: 'black' }, { num: 7, color: 'red' }, { num: 28, color: 'black' },
  { num: 12, color: 'red' }, { num: 35, color: 'black' }, { num: 3, color: 'red' },
  { num: 26, color: 'black' },
];

type BetType = 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | null;

export const Roulette = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [betType, setBetType] = useState<BetType>(null);
  const [result, setResult] = useState<typeof ROULETTE_NUMBERS[0] | null>(null);
  const [message, setMessage] = useState('');
  const [rotation, setRotation] = useState(0);

  const spin = async () => {
    if (!profile || spinning || !betType) return;
    if (betAmount > profile.balance) {
      setMessage('Insufficient balance!');
      return;
    }
    if (betAmount < 1) {
      setMessage('Minimum bet is 1 credit');
      return;
    }

    setSpinning(true);
    setMessage('Spinning...');
    setResult(null);

    const randomResult = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
    const winningIndex = ROULETTE_NUMBERS.findIndex(n => n.num === randomResult.num);

    const baseSpins = 5 * 360;
    const anglePerSegment = 360 / ROULETTE_NUMBERS.length;
    const winningAngle = winningIndex * anglePerSegment;
    const randomOffset = (Math.random() - 0.5) * anglePerSegment * 0.8;
    const finalRotation = baseSpins - winningAngle + randomOffset;
    
    setRotation(rotation + finalRotation);

    setTimeout(async () => {
      setResult(randomResult);
      let won = false;
      let payout = 0;
      if (betType === 'red' && randomResult.color === 'red') won = true;
      else if (betType === 'black' && randomResult.color === 'black') won = true;
      else if (betType === 'even' && randomResult.num !== 0 && randomResult.num % 2 === 0) won = true;
      else if (betType === 'odd' && randomResult.num !== 0 && randomResult.num % 2 === 1) won = true;
      else if (betType === 'low' && randomResult.num >= 1 && randomResult.num <= 18) won = true;
      else if (betType === 'high' && randomResult.num >= 19 && randomResult.num <= 36) won = true;
      
      if(won) {
        payout = betAmount * 2;
        setMessage(`WIN! Ball landed on ${randomResult.num} (${randomResult.color})`);
      } else {
        setMessage(`LOSE! Ball landed on ${randomResult.num} (${randomResult.color})`);
      }

      const newBalance = profile.balance - betAmount + payout;
      await LocalStorage.updateProfile(profile.id, {
        balance: newBalance,
        total_wagered: profile.total_wagered + betAmount,
        total_won: profile.total_won + payout,
      });
      await LocalStorage.addGameHistory({
        user_id: profile.id,
        game_type: 'roulette',
        bet_amount: betAmount,
        payout_amount: payout,
        game_data: { result: randomResult, betType },
      });
      refreshProfile();
      setSpinning(false);
    }, 4500);
  };

  const betButtons = [
    { type: 'red' as BetType, label: 'Red', color: 'from-red-600 to-red-700' },
    { type: 'black' as BetType, label: 'Black', color: 'from-slate-800 to-slate-900' },
    { type: 'even' as BetType, label: 'Even', color: 'from-blue-600 to-blue-700' },
    { type: 'odd' as BetType, label: 'Odd', color: 'from-blue-600 to-blue-700' },
    { type: 'low' as BetType, label: '1-18', color: 'from-emerald-600 to-emerald-700' },
    { type: 'high' as BetType, label: '19-36', color: 'from-emerald-600 to-emerald-700' },
  ];
  
  const anglePerItem = 360 / ROULETTE_NUMBERS.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2">
            <ArrowLeft size={20} /> Back to Lobby
        </button>

        <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-2">
              <CircleDot size={32} /> Roulette
            </h2>
            <p className="text-slate-400">Place your bets!</p>
          </div>

          <div className="flex justify-center items-center mb-8">
            <div className="relative w-80 h-80">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[10px] border-t-amber-300"></div>
              <motion.div
                className="relative w-full h-full rounded-full border-8 border-slate-900 shadow-2xl bg-slate-700"
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.33, 1, 0.68, 1] }}
              >
                {ROULETTE_NUMBERS.map(({ num, color }, index) => (
                  <div
                    key={num}
                    className="absolute w-1/2 h-1/2 origin-bottom-right"
                    style={{ transform: `rotate(${index * anglePerItem}deg)` }}
                  >
                    <div
                      className={`w-full h-full clip-path-wedge flex items-start justify-center text-white font-bold text-lg pt-2 ${
                        color === 'red' ? 'bg-red-600' : color === 'black' ? 'bg-slate-800' : 'bg-green-600'
                      }`}
                    >
                      <span style={{ transform: `rotate(${anglePerItem / 2}deg) translateY(-2px)` }}>{num}</span>
                    </div>
                  </div>
                ))}
                <div className="absolute inset-8 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500"></div>
                </div>
              </motion.div>
            </div>
          </div>
          
          {message && ( <div className="text-center text-lg font-semibold py-2 mb-4">{message}</div> )}
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-slate-300 mb-2">Bet Amount: {betAmount} credits</label>
              <input type="range" min="1" max={Math.min(100, profile?.balance || 0)} value={betAmount} onChange={(e) => setBetAmount(Number(e.target.value))} disabled={spinning} className="w-full ... accent-amber-500" />
            </div>
            <div>
              <label className="block text-slate-300 mb-2">Select Bet:</label>
              <div className="grid grid-cols-2 gap-3">
                {betButtons.map(btn => (
                  <button key={btn.type} onClick={() => setBetType(btn.type)} disabled={spinning} className={`py-3 px-4 ... ${betType === btn.type ? `... ring-2 ring-amber-400 scale-105` : `... opacity-70 hover:opacity-100`}`}>
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={spin} disabled={spinning || !profile || !betType || betAmount > (profile?.balance || 0)} className="w-full ...">
              {spinning ? 'SPINNING...' : betType ? `SPIN (Bet on ${betType})` : 'SELECT BET TYPE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};