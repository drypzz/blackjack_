'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, X, RefreshCw, CircleDot } from 'lucide-react'
import { CheckCircleIcon, XCircleIcon, } from '@heroicons/react/24/solid'
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

type BetType = 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | null

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
]

const betButtons = [
  { type: 'red' as BetType, label: 'Vermelho', color: 'from-red-500 to-red-700' },
  { type: 'black' as BetType, label: 'Preto', color: 'from-slate-700 to-slate-900' },
  { type: 'even' as BetType, label: 'Par', color: 'from-blue-600 to-blue-800' },
  { type: 'odd' as BetType, label: 'Ímpar', color: 'from-blue-600 to-blue-800' },
  { type: 'low' as BetType, label: '1–18', color: 'from-emerald-600 to-emerald-700' },
  { type: 'high' as BetType, label: '19–36', color: 'from-emerald-600 to-emerald-700' },
]

export const Roulette = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth()
  const [spinning, setSpinning] = useState(false)
  const [betAmount, setBetAmount] = useState<number | string>(10)
  const [betType, setBetType] = useState<BetType>(null)
  const [result, setResult] = useState<typeof ROULETTE_NUMBERS[0] | null>(null)
  const [rotation, setRotation] = useState(0)
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null)
  const [endGameInfo, setEndGameInfo] = useState<ModalInfo>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [canPlayAgain, setCanPlayAgain] = useState(false)

  const getBetButton = () => betButtons.find(b => b.type === betType)?.label

  const spinAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      spinAudioRef.current = new Audio('/sounds/roulette-spin.mp3')
      spinAudioRef.current.loop = true
      spinAudioRef.current.volume = 0.4
    }
  }, [])

  const handleBetAmountChange = (value: number | string) => {
    if (value === '') {
      setBetAmount('')
      return
    }
    
    const numValue = Number(value)
    if (profile && !isNaN(numValue)) {
      const clampedValue = Math.min(numValue, profile.balance)
      setBetAmount(clampedValue)
    }
  }
  
  const handleBetBlur = () => {
    const numericValue = Number(betAmount)
    if (isNaN(numericValue) || numericValue < 10) {
      setBetAmount(10)
    }
  }

  const handleModalClose = () => {
    setModalInfo(null)
    setCanPlayAgain(true)
  }

  const spin = async () => {
    const numericBetAmount = Number(betAmount)
    if (!profile || spinning || !betType) return
    if (numericBetAmount > profile.balance) {
      setModalInfo({type: 'loss', title: 'Saldo Insuficiente!', message: `Você tentou apostar ${formatMoney(numericBetAmount)}, mas só tem ${formatMoney(profile.balance)}.`})
      return
    }
    if (numericBetAmount < 10) {
      setModalInfo({type: 'loss', title: 'Aposta Mínima', message: 'A aposta mínima na roleta é de 10 créditos.'})
      return
    }

    const newBalanceAfterBet = profile.balance - numericBetAmount
    await LocalStorage.updateProfile(profile.id, {
      balance: newBalanceAfterBet,
      total_wagered: profile.total_wagered + numericBetAmount,
    })
    refreshProfile()

    spinAudioRef.current?.play()
    setSpinning(true)
    setResult(null)

    const randomResult = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
    const winningIndex = ROULETTE_NUMBERS.findIndex(n => n.num === randomResult.num)

    const totalSegments = ROULETTE_NUMBERS.length
    const anglePerSegment = 360 / totalSegments
    const winningAngle = (winningIndex + 0.5) * anglePerSegment
    const randomOffset = (Math.random() - 0.5) * (anglePerSegment * 0.8)
    const targetAngle = -winningAngle - randomOffset
    const newRotation = rotation - (rotation % 360) + (5 * 360) + targetAngle
    
    setRotation(newRotation)

    setTimeout(() => {
      if (spinAudioRef.current) {
        spinAudioRef.current.pause()
        spinAudioRef.current.currentTime = 0
      }
      setResult(randomResult)

      setTimeout(async () => {
        let won = false
        let payout = 0

        if (betType === 'red' && randomResult.color === 'red') won = true
        else if (betType === 'black' && randomResult.color === 'black') won = true
        else if (betType === 'even' && randomResult.num !== 0 && randomResult.num % 2 === 0) won = true
        else if (betType === 'odd' && randomResult.num !== 0 && randomResult.num % 2 === 1) won = true
        else if (betType === 'low' && randomResult.num >= 1 && randomResult.num <= 18) won = true
        else if (betType === 'high' && randomResult.num >= 19 && randomResult.num <= 36) won = true

        const ramdomResultColorTrad = randomResult.color === 'red' ? 'vermelho' : randomResult.color === 'black' ? 'preto' : 'verde'
        
        let modalData: ModalInfo = null

        if (won) {
          payout = numericBetAmount * 2
          const netWin = payout
          
          modalData = {
            type: 'win',
            title: 'Você Ganhou!',
            amount: netWin,
            message: `O resultado foi ${randomResult.num} ${ramdomResultColorTrad}. Sua aposta em '${getBetButton()}' venceu!`,
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
            message: `O resultado foi ${randomResult.num} ${ramdomResultColorTrad}. Mais sorte da próxima vez.`,
          }
        }
        
        setModalInfo(modalData)
        setEndGameInfo(modalData)

        await LocalStorage.addGameHistory({
          user_id: profile.id,
          game_type: 'roulette',
          bet_amount: numericBetAmount,
          payout_amount: payout,
          game_data: { result: randomResult, betType },
        })
        
        refreshProfile()
        setSpinning(false)
      }, 800)

    }, 3000)
  }

  const newGame = () => {
    setResult(null)
    setBetType(null)
    setModalInfo(null)
    setEndGameInfo(null)
    setShowConfetti(false)
    setCanPlayAgain(false)
  }

  const anglePerItem = 360 / ROULETTE_NUMBERS.length
  
  const conicGradient = `conic-gradient(${ROULETTE_NUMBERS.map((item, i) => {
    const color =
      item.color === 'green' ? '#009966' :
      item.color === 'red' ? '#da3036' :
      '#171717'
    
    const from = anglePerItem * i
    const to = anglePerItem * (i + 1)
    return `${color} ${from}deg ${to}deg`
  }).join(', ')})`

  return (
    <main className='min-h-screen from-slate-900 via-gray-900 to-slate-900 p-4 md:p-6 text-white font-sans overflow-hidden'>
      <AnimatePresence>
        {modalInfo && <ResultModal info={modalInfo} onClose={handleModalClose} />}
      </AnimatePresence>

      <div className='max-w-4xl mx-auto'>
        <button
          onClick={onBack}
          className='mb-4 cursor-pointer px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md'
        >
          <ArrowLeft size={20} /> Voltar ao Lobby
        </button>

        <div className='bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-6 md:p-8'>
          {showConfetti && <ConfettiComponent />}
          <div className='text-center mb-6'>
            <h1 className='text-4xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-3 tracking-wider'>
              <CircleDot size={32} /> Roleta
            </h1>
          </div>

          <div className='relative flex justify-center items-center my-8'>
            <div className='absolute -top-2 z-10'>
              <div className='w-0 h-0 
                border-l-[10px] border-l-transparent
                border-r-[10px] border-r-transparent
                border-t-[20px] border-t-amber-400 drop-shadow-lg'></div>
            </div>

            <motion.div
              className='relative w-80 h-80 md:w-96 md:h-96 rounded-full border-8 border-slate-900 shadow-2xl'
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: 'easeOut' }}
            >
              <div 
                className='absolute inset-0 rounded-full'
                style={{ background: conicGradient }}
              />

              {ROULETTE_NUMBERS.map((item, index) => {
                const angle = anglePerItem * index
                const numberAngle = angle + anglePerItem / 2
          
                return (
                  <div
                    key={`${item.num}-${index}`}
                    className='absolute inset-0 flex justify-center items-start pt-1 md:pt-2'
                    style={{
                      transform: `rotate(${numberAngle}deg)`
                    }}
                  >
                    <span
                      className='text-white font-bold text-base'
                      style={{
                        transform: `rotate(0deg)`
                      }}
                    >
                      {item.num}
                    </span>
                  </div>
                )
              })}

              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-700 rounded-full border-4 border-slate-600 flex items-center justify-center shadow-inner'>
                <div className='w-12 h-12 bg-slate-800 rounded-full border-2 border-slate-600'></div>
              </div>
            </motion.div>
          </div>
          
          <AnimatePresence>
            {endGameInfo && !modalInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
              >
                <h3 className={`text-2xl font-bold ${endGameInfo.type === 'win' ? 'text-emerald-400' : 'text-red-500'}`}>
                  {endGameInfo.title}
                </h3>
                {endGameInfo.amount && endGameInfo.amount > 0 && (
                   <p className='text-2xl font-bold text-emerald-400'>
                    +{formatMoney(endGameInfo.amount)}
                  </p>
                )}
                <p className="text-slate-300">{endGameInfo.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className='space-y-6'>
            {result ? (
              <div className='max-w-sm mx-auto'>
                <button
                  onClick={newGame} disabled={!canPlayAgain}
                  className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer'
                >
                  <RefreshCw size={24}/>
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
                    className='w-32 bg-slate-900/70 border-2 border-slate-600 rounded-lg text-amber-400 text-center text-xl font-bold py-2 px-2 focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none'
                    placeholder='10'
                  />
                  <input
                    type='range'
                    min='10'
                    max={profile?.balance || 10}
                    value={Number(betAmount)}
                    onChange={(e) => handleBetAmountChange(e.target.value)}
                    disabled={spinning}
                    className='w-full h-3 bg-slate-700 rounded-lg accent-amber-500 cursor-pointer'
                  />
                </div>
                <div className='flex justify-center gap-2 mt-3'>
                  <button onClick={() => handleBetAmountChange(Math.floor(Number(betAmount) / 2))} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>½</button>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) * 2)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>2x</button>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) + 10)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+10</button>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) + 100)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+100</button>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) + 500)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+500</button>
                </div>
                <div className='flex justify-center gap-2 mt-3'>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) + 1000)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+1000</button>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) + 2000)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+2000</button>
                  <button onClick={() => handleBetAmountChange(Number(betAmount) + 5000)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>+5000</button>
                  <button onClick={() => handleBetAmountChange(profile?.balance || 0)} disabled={spinning} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors cursor-pointer'>Max</button>
                </div>
              </div>

              <div className='max-w-lg mx-auto'>
                <label className='block text-slate-300 mb-3 text-center text-lg'>
                  Escolha sua aposta:
                </label>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  {betButtons.map((btn, index) => (
                    <button
                      key={btn.type}
                      onClick={() => setBetType(btn.type)}
                      disabled={spinning}
                      className={`py-3 px-2 text-sm font-bold rounded-xl text-white uppercase tracking-wider shadow-md transition-all duration-200 bg-gradient-to-r ${btn.color} cursor-pointer
                        ${
                          betType === btn.type
                            ? 'ring-2 ring-amber-400 scale-105'
                            : 'opacity-80 hover:opacity-100'
                        }
                        ${
                          index === 4 ? 'sm:col-start-2' : ''
                        }
                      `}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className='max-w-sm mx-auto'>
                <button
                  onClick={spin}
                  disabled={spinning || !profile || !betType || Number(betAmount) > (profile?.balance || 0) || Number(betAmount) < 10}
                  className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest cursor-pointer'
                >
                  {spinning
                    ? 'GIRANDO...'
                    : betType
                    ? `Apostar em ${getBetButton()}`
                    : 'Selecione um tipo de aposta'}
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
