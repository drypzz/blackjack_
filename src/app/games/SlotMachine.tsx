'use client'

import { useState, useEffect } from 'react'
import { Cherry, Grape, Citrus, DollarSign, Sparkles, ArrowLeft, X, RefreshCw } from 'lucide-react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence } from 'framer-motion'

import { ConfettiComponent } from '@/app/components/Confetti'
import { useAuth } from '@/app/contexts/AuthContext'
import { LocalStorage } from '@/app/lib/storage'
import { formatMoney } from '@/app/utils/maskUtils'

type ModalInfo = {
  type: 'win' | 'loss'
  title: string
  message: string
  amount?: number
} | null

const SYMBOLS = [
  { id: 'cherry', icon: Cherry, color: 'text-red-500', weight: 40 },
  { id: 'lemon', icon: Citrus, color: 'text-yellow-400', weight: 30 },
  { id: 'grape', icon: Grape, color: 'text-purple-500', weight: 20 },
  { id: 'dollar', icon: DollarSign, color: 'text-green-400', weight: 10 },
]
const PAYOUTS = { cherry: 2, lemon: 3, grape: 5, dollar: 10 }

const ResultModal = ({ info, onClose }: { info: ModalInfo; onClose: () => void }) => {
  if (!info) return null

  const icons = {
    win: <CheckCircleIcon className='h-16 w-16 text-emerald-400' />,
    loss: <XCircleIcon className='h-16 w-16 text-red-500' />,
  }
  const borderColors = {
    win: 'border-emerald-500',
    loss: 'border-red-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        className={`bg-slate-800 rounded-2xl border-2 ${borderColors[info.type]} shadow-2xl p-8 w-full max-w-md text-center relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className='cursor-pointer absolute top-3 right-3 text-slate-400 hover:text-white transition-colors'><X size={24} /></button>
        <div className='flex justify-center mb-4'>{icons[info.type]}</div>
        <h2 className='text-3xl font-bold text-white mb-2'>{info.title}</h2>
        {info.amount && info.amount > 0 && (
          <p className='text-4xl font-bold text-emerald-400 my-4'>
            +{formatMoney(info.amount)}
          </p>
        )}
        <p className='text-slate-300 text-lg'>{info.message}</p>
      </motion.div>
    </motion.div>
  )
}

const Reel = ({ finalSymbolId, isSpinning }: { finalSymbolId: string; isSpinning: boolean }) => {
    return (
        <div className='h-28 sm:h-32 overflow-hidden bg-slate-900/80 rounded-xl flex items-center justify-center relative border-2 border-slate-700 shadow-inner bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl border-4 border-yellow-400 shadow-[inset_0_0_20px_rgba(255,255,255,0.2),0_0_25px_rgba(255,215,0,0.5)] flex items-center justify-center'>
            <motion.div
                animate={{ y: isSpinning ? ['0%', `-${SYMBOLS.length * 15}%`] : '0%' }}
                transition={isSpinning ? { duration: 0.5, repeat: Infinity, ease: 'linear' } : { duration: 0.5, ease: [0.25, 1, 0.5, 1] }} 
            >
                {[...SYMBOLS, ...SYMBOLS].map((s, index) => {
                    const Icon = s.icon
                    return <div key={`${s.id}-${index}`} className='h-28 sm:h-32 flex items-center justify-center'><Icon size={64} className={s.color} strokeWidth={2.5} /></div>
                })}
            </motion.div>

            <AnimatePresence>
                {!isSpinning && finalSymbolId && (
                     <motion.div
                        key={finalSymbolId}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className='absolute inset-0 flex items-center justify-center bg-slate-900/40 rounded-xl backdrop-blur-sm' 
                     >
                        {(() => {
                            const symbol = SYMBOLS.find(s => s.id === finalSymbolId);
                            if (!symbol) return null;
                            const Icon = symbol.icon
                            const color = symbol.color
                            return <Icon size={72} className={`${symbol.color} drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]`} strokeWidth={2.5} />
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const SlotMachine = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth()
  const [reels, setReels] = useState(['cherry', 'lemon', 'grape'])
  const [spinning, setSpinning] = useState(false)
  const [betAmount, setBetAmount] = useState<number | string>(10) 
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null)
  const [endGameInfo, setEndGameInfo] = useState<ModalInfo>(null) 
  const [showConfetti, setShowConfetti] = useState(false)
  const [canPlayAgain, setCanPlayAgain] = useState(false)

  const handleBetAmountChange = (value: number | string) => {
    if (value === '') {
      setBetAmount('')
      return
    }
    const numValue = Number(value)
    if (profile && !isNaN(numValue)) {
      const clampedValue = Math.max(1, Math.min(numValue, profile.balance));
      setBetAmount(clampedValue)
    }
  }

  const handleBetBlur = () => {
    const numericValue = Number(betAmount)
    if (isNaN(numericValue) || numericValue < 1) {
      setBetAmount(1)
    }
  }

  const getRandomSymbol = () => {
    const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0)
    let random = Math.random() * totalWeight
    for (const symbol of SYMBOLS) {
      random -= symbol.weight
      if (random <= 0) return symbol.id
    }
    return SYMBOLS[0].id
  }

  const spin = async () => {
    const numericBetAmount = Number(betAmount);
    if (!profile || spinning) return
    if (numericBetAmount > profile.balance) {
       setModalInfo({ type: 'loss', title: 'Saldo Insuficiente!', message: `Você tentou apostar ${formatMoney(numericBetAmount)}, mas só tem ${formatMoney(profile.balance)}.` })
      return
    }
    if (numericBetAmount < 1) {
       setModalInfo({ type: 'loss', title: 'Aposta Mínima', message: 'A aposta mínima é 1 crédito.' })
      return
    }

    setSpinning(true)
    setModalInfo(null)
    setEndGameInfo(null)
    setShowConfetti(false)
    setCanPlayAgain(false)

    const newBalanceAfterBet = profile.balance - numericBetAmount;
    await LocalStorage.updateProfile(profile.id, {
      balance: newBalanceAfterBet,
      total_wagered: profile.total_wagered + numericBetAmount,
    });
    refreshProfile();

    const spinDuration = 2000 + Math.random() * 1000

setTimeout(async () => {
  const finalReels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
  setReels(finalReels)

  setSpinning(false)

  setTimeout(async () => {
    const allSame = finalReels.every(symbol => symbol === finalReels[0])
    let payout = 0
    let modalData: ModalInfo = null

    if (allSame) {
      const multiplier = PAYOUTS[finalReels[0] as keyof typeof PAYOUTS]
      payout = numericBetAmount * multiplier
      modalData = {
        type: 'win',
        title: 'Você Ganhou!',
        amount: payout,
        message: `Combinação de ${finalReels[0]}! Pagamento de ${multiplier}x!`,
      }
      setShowConfetti(true)

      const finalBalance = newBalanceAfterBet + payout
      await LocalStorage.updateProfile(profile.id, {
        balance: finalBalance,
        total_won: profile.total_won + payout,
      })
    } else {
      payout = 0
      modalData = {
        type: 'loss',
        title: 'Não foi dessa vez!',
        message: 'Sem combinação. Tente novamente!',
      }
    }

    setModalInfo(modalData)
    setEndGameInfo(modalData)

    await LocalStorage.addGameHistory({
      user_id: profile.id,
      game_type: 'slots',
      bet_amount: numericBetAmount,
      payout_amount: payout,
      game_data: { reels: finalReels },
      balance_after: newBalanceAfterBet + payout,
    })

    refreshProfile()
  }, 500)
}, spinDuration)

  }
  const newGame = () => {
    setModalInfo(null)
    setEndGameInfo(null)
    setShowConfetti(false)
    setCanPlayAgain(false)
  }

  const handleModalClose = () => {
    setModalInfo(null)
    setShowConfetti(false)
    if (endGameInfo) {
      setCanPlayAgain(true)
    }
  }


  return (
    <main className='relative mx-auto max-w-2xl bg-gradient-to-b from-yellow-600 to-yellow-800 p-4 rounded-[2rem] border-[6px] border-yellow-400 shadow-[0_0_40px_rgba(255,200,0,0.5)] mt-8 mb-8'>
      <AnimatePresence>
        {modalInfo && <ResultModal info={modalInfo} onClose={handleModalClose} />}
      </AnimatePresence>

      <div className='max-w-3xl mx-auto'>
        <button
          onClick={onBack}
          className='mb-4 cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md'
        >
          <ArrowLeft size={20} /> Voltar ao Lobby
        </button>

        <div className='bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-6 md:p-8 relative'>
          {showConfetti && <ConfettiComponent />}
          <div className='text-center mb-6'>
            <h1 className='text-4xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-3 tracking-wider'>
              <Sparkles size={32} /> Slot Machine
            </h1>
             <p className='text-slate-400'>Combine 3 símbolos para ganhar!</p>
          </div>

          <div className='bg-gradient-to-br from-slate-900/50 to-slate-800/50 rounded-xl p-6 sm:p-8 mb-6 border-2 border-amber-500/30 shadow-lg relative'>
             {spinning && (
                 <motion.div
                    className="absolute inset-x-0 top-0 h-1 bg-amber-400 rounded-t-lg"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                 />
             )}
            <div className='grid grid-cols-3 gap-4'>
              <Reel finalSymbolId={reels[0]} isSpinning={spinning} />
              <Reel finalSymbolId={reels[1]} isSpinning={spinning} />
              <Reel finalSymbolId={reels[2]} isSpinning={spinning} />
            </div>
          </div>

           <AnimatePresence>
            {endGameInfo && !modalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6 h-16 flex flex-col justify-center items-center"
              >
                <h3 className={`text-2xl font-bold ${endGameInfo.type === 'win' ? 'text-emerald-400' : 'text-red-500'}`}>
                  {endGameInfo.title}
                </h3>
                {endGameInfo.amount && endGameInfo.amount > 0 && (
                  <p className='text-xl font-semibold text-emerald-400'>
                    +{formatMoney(endGameInfo.amount)}
                  </p>
                )}
                 {!endGameInfo.amount && endGameInfo.type === 'loss' && (
                     <p className="text-slate-300">{endGameInfo.message}</p>
                 )}
              </motion.div>
            )}
             {!endGameInfo && !modalInfo && <div className="h-16"></div>}
           </AnimatePresence>

          <div className='space-y-6'>
             {endGameInfo && !modalInfo ? (
                 <div className='max-w-sm mx-auto'>
                    <button
                      onClick={newGame} disabled={!canPlayAgain}
                      className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer'
                    >
                      <RefreshCw size={24} />
                      Jogar Novamente
                    </button>
                 </div>
             ) : (
                 <>
                   <div className='max-w-sm mx-auto'>
                     <label className='block text-slate-300 mb-2 text-center text-lg'>
                       {`Valor da Aposta: `}
                       <span className='font-bold text-amber-400 text-xl'>
                         {formatMoney(Number(betAmount))}
                       </span>
                     </label>
                     <div className='flex items-center gap-4'>
                       <input
                         type='number'
                         value={betAmount}
                         onChange={(e) => handleBetAmountChange(e.target.value)}
                         onBlur={handleBetBlur}
                         disabled={spinning}
                         min="1"
                         step="1" 
                         max={profile?.balance || 1} 
                         className='w-32 bg-slate-900/70 border-2 border-slate-600 rounded-lg text-amber-400 text-center text-xl font-bold py-2 px-2 focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none'
                         placeholder='1'
                       />
                       <input
                         type='range'
                         min='1'
                         max={Math.max(1, profile?.balance || 1)} 
                         value={Number(betAmount)}
                         onChange={(e) => handleBetAmountChange(e.target.value)}
                         disabled={spinning}
                         className='w-full h-3 bg-slate-700 rounded-lg accent-amber-500 cursor-pointer'
                       />
                     </div>
                     <div className='flex flex-wrap justify-center gap-2 mt-3'>
                       <button onClick={() => handleBetAmountChange(Math.max(1, Math.floor(Number(betAmount) / 2)))} disabled={spinning} className='px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>½</button>
                       <button onClick={() => handleBetAmountChange(Number(betAmount) * 2)} disabled={spinning} className='px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>2x</button>
                       <button onClick={() => handleBetAmountChange(Number(betAmount) + 10)} disabled={spinning} className='px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+10</button>
                       <button onClick={() => handleBetAmountChange(Number(betAmount) + 50)} disabled={spinning} className='px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+50</button>
                       <button onClick={() => handleBetAmountChange(Number(betAmount) + 100)} disabled={spinning} className='px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+100</button>
                       <button onClick={() => handleBetAmountChange(profile?.balance || 1)} disabled={spinning} className='px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>Max</button>
                     </div>
                   </div>

                   <div className='max-w-sm mx-auto'>
                      <button
                        onClick={spin}
                        disabled={spinning || !profile || Number(betAmount) > (profile?.balance || 0) || Number(betAmount) < 1}
                        className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2'
                      >
                         <Sparkles size={24}/>
                        {spinning ? 'GIRANDO...' : 'Girar'}
                      </button>
                   </div>
                 </>
             )}
          </div>
        </div>
      </div>
    </main>
  )
}