'use client'

import { useState, useEffect } from 'react'
import { Spade, ArrowLeft, Heart, Diamond, Club, X, Hand, Plus, RefreshCw } from 'lucide-react'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'
import { motion, AnimatePresence, Variants } from 'framer-motion'

import { ConfettiComponent } from '@/app/components/Confetti'
import { useAuth } from '@/app/contexts/AuthContext'
import { LocalStorage } from '@/app/lib/storage'
import { formatMoney } from '@/app/utils/maskUtils'

type Card = {
  suit: string
  value: string
  numValue: number
}
type GameState = 'betting' | 'playing' | 'dealer-turn' | 'finished'
type Winner = 'player' | 'dealer' | 'push' | null
type ModalInfo = {
  type: 'win' | 'loss' | 'push'
  title: string
  message: string
} | null

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const CardComponent = ({ card, hidden }: { card: Card | null; hidden?: boolean }) => {
  const cardSize = 'w-20 h-28 sm:w-24 sm:h-36'
  const iconSize = { base: 36, sm: 48 }
  const valueSize = 'text-xl sm:text-2xl'

  if (hidden || !card) {
    return (
      <div className={`${cardSize} bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg border-2 border-slate-600 flex items-center justify-center shadow-lg`}>
        <Spade className='text-slate-600/50' size={iconSize.sm} strokeWidth={1.5} />
      </div>
    )
  }
  const isRed = ['♥', '♦'].includes(card.suit)
  const cardColor = isRed ? 'text-red-600' : 'text-slate-900'
  const SuitIcon = ({ size }: { size?: number }) => {
    switch (card.suit) {
      case '♠': return <Spade className={cardColor} size={size} />
      case '♥': return <Heart className={cardColor} size={size} />
      case '♦': return <Diamond className={cardColor} size={size} />
      case '♣': return <Club className={cardColor} size={size} />
      default: return null
    }
  }
  return (
    <div className={`${cardSize} bg-slate-50 rounded-lg border border-slate-300 flex flex-col items-center justify-center p-1 sm:p-2 shadow-lg relative`}>
      <div className='absolute top-1 left-1 sm:left-2 text-left'>
        <div className={`${valueSize} font-bold ${cardColor}`}>{card.value}</div>
        <SuitIcon />
      </div>
      <div className='absolute'>
        <SuitIcon size={iconSize.base} />
      </div>
      <div className='absolute bottom-1 right-1 sm:right-2 text-right transform rotate-180'>
        <div className={`${valueSize} font-bold ${cardColor}`}>{card.value}</div>
        <SuitIcon />
      </div>
    </div>
  )
}

const ResultModal = ({ info, onClose }: { info: ModalInfo; onClose: () => void }) => {
  if (!info) return null

  const icons = {
    win: <CheckCircleIcon className='h-12 w-12 text-emerald-400' />,
    loss: <XCircleIcon className='h-12 w-12 text-red-500' />,
    push: <ExclamationTriangleIcon className='h-12 w-12 text-amber-400' />,
  }
  const borderColors = {
    win: 'border-emerald-500',
    loss: 'border-red-600',
    push: 'border-amber-500',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        className={`bg-slate-800 rounded-2xl border-2 ${borderColors[info.type]} shadow-2xl p-6 sm:p-8 w-full max-w-md text-center relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className='cursor-pointer absolute top-3 right-3 text-slate-400 hover:text-white transition-colors'><X size={24} /></button>
        <div className='flex justify-center mb-4'>{icons[info.type]}</div>
        <h2 className='text-3xl font-bold text-white mb-2'>{info.title}</h2>
        <p className='text-slate-300 text-lg'>{info.message}</p>
      </motion.div>
    </motion.div>
  )
}

export const Blackjack = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth()
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [gameState, setGameState] = useState<GameState>('betting')
  const [dealerVisibleScore, setDealerVisibleScore] = useState(0)
  const [warningMessage, setWarningMessage] = useState('')
  const [winner, setWinner] = useState<Winner>(null)
  const [modalInfo, setModalInfo] = useState<ModalInfo>(null)
  const [canPlayAgain, setCanPlayAgain] = useState(false)

  const handleBetAmountChange = (value: number | string) => {
    if (value === '') {
      setBetAmount(10)
      return
    }
    
    const numValue = Number(value)
    if (profile && !isNaN(numValue)) {
      const clampedValue = Math.min(numValue, profile.balance)
      setBetAmount(clampedValue)
    }
  }

  const createDeck = (): Card[] => {
    const newDeck: Card[] = []
    for (const suit of SUITS) {
      for (const value of VALUES) {
        let numValue = parseInt(value)
        if (value === 'A') numValue = 11
        else if (['J', 'Q', 'K'].includes(value)) numValue = 10
        newDeck.push({ suit, value, numValue })
      }
    }
    return newDeck.sort(() => Math.random() - 0.5)
  }

  const calculateScore = (hand: Card[]): number => {
    let score = hand.reduce((sum, card) => sum + card.numValue, 0)
    let aces = hand.filter(card => card.value === 'A').length
    while (score > 21 && aces > 0) {
      score -= 10
      aces--
    }
    return score
  }

  const dealInitialCards = async () => {
    if (!profile || betAmount > profile.balance) {
      setWarningMessage('Saldo insuficiente!')
      setTimeout(() => setWarningMessage(''), 3000)
      return
    }
    if (betAmount < 1) {
      setWarningMessage('Aposta mínima é 1 crédito')
      setTimeout(() => setWarningMessage(''), 3000)
      return
    }

    const newBalance = profile.balance - betAmount
    await LocalStorage.updateProfile(profile.id, {
      balance: newBalance,
      total_wagered: profile.total_wagered + betAmount,
    })
    refreshProfile()

    const tempDeck = createDeck()
    const tempPlayerHand = [tempDeck.pop()!, tempDeck.pop()!]

    const winningStreak = checkWinningStreak()
    let tempDealerHand: Card[]

    if (winningStreak >= 3) {
      console.log(`MODO DIFÍCIL ATIVADO! Sequência de ${winningStreak} vitórias.`)
      tempDealerHand = getRiggedDealerHand(tempDeck)
    } else {
      const holeCard = tempDeck.pop()!
      const upCard = tempDeck.pop()!
      tempDealerHand = [holeCard, upCard]
    }

    if (calculateScore(tempPlayerHand) === 21 && winningStreak < 3) {
      const dealerNeeds = 21 - calculateScore(tempDealerHand)
      const favorableCardIndex = tempDeck.findIndex(card => card.numValue === dealerNeeds || calculateScore(tempDealerHand) + card.numValue >= 17)
      if (favorableCardIndex > -1) {
        const favorableCard = tempDeck.splice(favorableCardIndex, 1)[0]
        tempDeck.push(tempDealerHand[0])
        tempDealerHand[0] = favorableCard
      }
    }

    setDeck(tempDeck)
    setPlayerHand(tempPlayerHand)
    setDealerHand(tempDealerHand)
    setGameState('playing')
    setWarningMessage('')

    if (calculateScore(tempPlayerHand) === 21) {
      setTimeout(() => stand(tempPlayerHand), 1000)
    }
  }

  const checkWinningStreak = (): number => {
    if (!profile) return 0

    const userHistory = LocalStorage.getGameHistoryForUser(profile.id, 5)
    let streak = 0
    for (const game of userHistory) {
      if (game.game_type === 'blackjack' && game.payout_amount > game.bet_amount) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const getRiggedDealerHand = (deck: Card[]): Card[] => {
    for (let i = 0; i < deck.length - 1; i++) {
      for (let j = i + 1; j < deck.length; j++) {
        const hand = [deck[i], deck[j]]
        const score = calculateScore(hand)
        if (score >= 19 && score <= 21) {
          const card1 = deck.splice(j, 1)[0]
          const card2 = deck.splice(i, 1)[0]
          console.log(`Mão do Dealer manipulada para ter ${score} pontos.`)
          return [card2, card1]
        }
      }
    }
    return [deck.pop()!, deck.pop()!]
  }

  const hit = () => {
    if (gameState !== 'playing' || !deck.length) return
    const newCard = deck.pop()!
    const newHand = [...playerHand, newCard]
    setPlayerHand(newHand)
    setDeck([...deck])
    const score = calculateScore(newHand)
    if (score > 21) {
      setTimeout(() => finishGame(newHand, dealerHand), 1000)
    } else if (score === 21) {
      stand(newHand)
    }
  }

  const stand = (currentHand?: Card[]) => {
    const hand = currentHand || playerHand
    setGameState('dealer-turn')
    setTimeout(() => {
      let newDealerHand = [...dealerHand]
      const currentDeck = [...deck]
      const dealerPlay = () => {
        const dealerScore = calculateScore(newDealerHand)
        if (dealerScore < 17 && currentDeck.length > 0) {
          const newCard = currentDeck.pop()!
          newDealerHand = [...newDealerHand, newCard]
          setDealerHand(newDealerHand)
          setDeck(currentDeck)
          setTimeout(dealerPlay, 800)
        } else {
          finishGame(hand, newDealerHand)
        }
      }
      dealerPlay()
    }, 800)
  }

  const finishGame = async (pHand: Card[], dHand: Card[], blackjack = false) => {
    setGameState('finished')
    const playerScore = calculateScore(pHand)
    const dealerScore = calculateScore(dHand)
    let payout = 0

    let tempWinner: Winner = null
    let tempModalInfo: ModalInfo = null

    if (playerScore > 21) {
      tempWinner = 'dealer'
      tempModalInfo = { type: 'loss', title: 'Não foi dessa vez!', message: `Você estourou com ${playerScore} pontos. O objetivo é chegar o mais perto de 21, sem passar.` }
    } else if (blackjack && dealerScore !== 21) {
      payout = betAmount * 2.5
      tempWinner = 'player'
      tempModalInfo = { type: 'win', title: 'Blackjack!', message: 'Você conseguiu 21 com suas duas primeiras cartas! Este é o melhor resultado possível.' }
    } else if (dealerScore > 21) {
      payout = betAmount * 2
      tempWinner = 'player'
      tempModalInfo = { type: 'win', title: 'Você Ganhou!', message: `O dealer estourou com ${dealerScore} pontos. Você ganha automaticamente.` }
    } else if (playerScore > dealerScore) {
      payout = betAmount * 2
      tempWinner = 'player'
      tempModalInfo = { type: 'win', title: 'Você Ganhou!', message: `Sua pontuação (${playerScore}) foi maior que a do dealer (${dealerScore}).` }
    } else if (playerScore < dealerScore) {
      tempWinner = 'dealer'
      tempModalInfo = { type: 'loss', title: 'Não foi dessa vez!', message: `A pontuação do dealer (${dealerScore}) foi maior que a sua (${playerScore}).` }
    } else {
      payout = betAmount
      tempWinner = 'push'
      tempModalInfo = { type: 'push', title: 'Empate!', message: `Ambos fizeram ${playerScore} pontos. Sua aposta foi devolvida.` }
    }

    setWinner(tempWinner)
    setTimeout(() => setModalInfo(tempModalInfo), 1200)

    if (profile && payout > 0) {
      const newBalance = profile.balance + payout
      await LocalStorage.updateProfile(profile.id, {
        balance: newBalance,
        total_won: profile.total_won + (payout > betAmount ? payout - betAmount : 0),
      })

      await LocalStorage.addGameHistory({
        user_id: profile.id,
        game_type: 'blackjack',
        bet_amount: betAmount,
        payout_amount: payout,
        game_data: { playerHand: pHand, dealerHand: dHand, playerScore, dealerScore },
      })
      refreshProfile()
    } else if (profile) {
      await LocalStorage.addGameHistory({
        user_id: profile.id,
        game_type: 'blackjack',
        bet_amount: betAmount,
        payout_amount: 0,
        game_data: { playerHand: pHand, dealerHand: dHand, playerScore, dealerScore },
      })
      refreshProfile()
    }
  }

  const newGame = () => {
    setGameState('betting')
    setPlayerHand([])
    setDealerHand([])
    setDeck([])
    setWarningMessage('')
    setDealerVisibleScore(0)
    setWinner(null)
    setModalInfo(null)
    setCanPlayAgain(false)
  }

  const handleModalClose = () => {
    setModalInfo(null)
    setCanPlayAgain(true)
  }

  useEffect(() => {
    if (dealerHand.length < 2) {
      setDealerVisibleScore(0)
      return
    }
    if (gameState === 'playing') {
      setDealerVisibleScore(calculateScore([dealerHand[1]]))
    } else {
      setDealerVisibleScore(calculateScore(dealerHand))
    }
  }, [dealerHand, gameState])

  const handVariants: Variants = {
    animate: { transition: { staggerChildren: 0.2 } }
  }
  const cardVariants: Variants = {
    initial: { y: -100, x: 50, opacity: 0, rotate: 25 },
    animate: {
      y: 0, x: 0, opacity: 1, rotate: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } }
  }
  const scoreVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 20 } },
  }

  const playerScore = calculateScore(playerHand)

  return (
    <main className='min-h-screen from-slate-900 via-gray-900 to-slate-900 p-4 md:p-6 text-white font-sans'>
      <AnimatePresence>
        {modalInfo && <ResultModal info={modalInfo} onClose={handleModalClose} />}
      </AnimatePresence>

      <div className='max-w-5xl mx-auto'>
        <button onClick={onBack} className='cursor-pointer mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md'>
          <ArrowLeft size={20} /> Voltar ao Lobby
        </button>
        <div className='bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-2 sm:p-4 md:p-8'>
          <div className='text-center mb-6'>
            <h1 className='text-3xl sm:text-4xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-3 tracking-wider'>
              <Spade size={32} /> Blackjack
            </h1>
            <p className='text-slate-400'>Seu Saldo: <span className='font-bold text-amber-300'>{formatMoney(profile?.balance ?? 0)}</span></p>
          </div>
          {gameState === 'betting' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='space-y-6 max-w-sm mx-auto'>
              <div>
                <label className='block text-slate-300 mb-2 text-center text-lg'>Valor da Aposta: <span className='font-bold text-amber-400 text-xl'>{formatMoney(betAmount)}</span></label>
                <div className='flex items-center gap-4 mb-4'>
                  <input
                    type='number' min='10' max={Math.max(10, profile?.balance ?? 10)} step='10' value={betAmount}
                    onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                    onBlur={() => { if(Number(betAmount) < 1 || betAmount === 10) handleBetAmountChange(10) }}
                    className='w-32 bg-slate-900/70 border-2 border-slate-600 rounded-lg text-amber-400 text-center text-xl font-bold py-2 px-2 focus:ring-2 focus:ring-amber-500 focus:outline-none appearance-none'
                    placeholder='10'
                  />
                  <input
                    type='range' min='10' max={Math.max(10, profile?.balance ?? 10)} step='10' value={betAmount}
                    onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                    className='w-full h-3 bg-slate-700 rounded-lg cursor-pointer accent-amber-500'
                  />
                </div>
              </div>
              <div className='flex justify-center gap-2 mt-3'>
                <button onClick={() => handleBetAmountChange(Math.floor(Number(betAmount) / 2))} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>½</button>
                <button onClick={() => handleBetAmountChange(Number(betAmount) * 2)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>2x</button>
                <button onClick={() => handleBetAmountChange(Number(betAmount) + 10)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>+10</button>
                <button onClick={() => handleBetAmountChange(Number(betAmount) + 100)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>+100</button>
                <button onClick={() => handleBetAmountChange(Number(betAmount) + 500)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>+500</button>
              </div>
              <div className='flex justify-center gap-2 mt-3'>
                <button onClick={() => handleBetAmountChange(Number(betAmount) + 1000)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>+1000</button>
                <button onClick={() => handleBetAmountChange(Number(betAmount) + 2000)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>+2000</button>
                <button onClick={() => handleBetAmountChange(Number(betAmount) + 5000)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>+5000</button>
                <button onClick={() => handleBetAmountChange(profile?.balance || 0)} className='px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors'>Max</button>
              </div>

              <button
                onClick={dealInitialCards}
                disabled={!profile || betAmount > (profile?.balance || 0)}
                className='cursor-pointer w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest'
              >
                Apostar
              </button>
            </motion.div>
          ) : (
            <div className='space-y-6'>
              <div className='bg-green-900/20 rounded-t-full border-4 border-amber-800/50 p-6 min-h-[220px] relative overflow-hidden'>
                {winner === 'dealer' && <ConfettiComponent />}
                <div className='flex justify-center items-center mb-4'>
                  <h3 className='text-xl font-semibold text-slate-300'>Dealer</h3>
                  <span className='text-lg text-amber-400 font-semibold bg-slate-900/50 px-3 py-1 rounded-md flex items-center gap-1'>
                    Pontuação:
                    <motion.span key={dealerVisibleScore} variants={scoreVariants} initial='initial' animate='animate'>
                      {dealerVisibleScore > 0 ? dealerVisibleScore : '?'}
                    </motion.span>
                  </span>
                </div>
                <motion.div variants={handVariants} initial='initial' animate='animate' className='flex gap-3 flex-wrap justify-center items-center min-h-[144px]'>
                  {dealerHand.map((card, index) => {
                    const isHoleCard = index === 1
                    const isHidden = isHoleCard && gameState === 'playing'
                    return (
                      <motion.div key={`dealer-${index}`} variants={cardVariants}>
                        <div className='relative w-24 h-36'>
                          <AnimatePresence initial={false}>
                            <motion.div
                              key={isHidden ? 'back' : 'front'}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className='absolute inset-0'
                            >
                              <CardComponent card={card} hidden={isHidden} />
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </div>

              <div className='bg-green-900/20 rounded-b-full border-4 border-amber-800/50 p-6 min-h-[220px] relative overflow-hidden'>
                {winner === 'player' && <ConfettiComponent />}
                <div className='flex justify-center items-center mb-4'>
                  <h3 className='text-xl font-semibold text-slate-300'>Você</h3>
                  <span className='text-lg text-amber-400 font-semibold bg-slate-900/50 px-3 py-1 rounded-md flex items-center gap-1'>
                    Pontuação:
                    <motion.span key={playerScore} variants={scoreVariants} initial='initial' animate='animate'>
                      {playerScore}
                    </motion.span>
                  </span>
                </div>
                <motion.div variants={handVariants} initial='initial' animate='animate' className='flex gap-3 flex-wrap justify-center items-center min-h-[144px]'>
                  {playerHand.map((card, index) => (
                    <motion.div key={`player-${index}`} variants={cardVariants}>
                      <CardComponent card={card} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className='h-24 flex flex-col items-center justify-center'>
                <AnimatePresence>
                  {warningMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className={`text-center text-lg font-bold py-2 px-4 rounded-lg bg-yellow-500/20 text-yellow-300`}
                    >
                      {warningMessage}
                    </motion.div>
                  )}
                </AnimatePresence>
                {gameState === 'playing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className='flex gap-4 w-full max-w-md'>
                    <button
                      onClick={hit}
                      className='cursor-pointer flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all text-base sm:text-lg uppercase tracking-wider'
                    >
                      <Plus size={20} strokeWidth={3} />
                      Pegar
                    </button>
                    <button
                      onClick={() => stand()}
                      className='cursor-pointer flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-rose-500/30 hover:scale-105 transition-all text-base sm:text-lg uppercase tracking-wider'
                    >
                      <Hand size={20} strokeWidth={3} />
                      Ficar
                    </button>
                  </motion.div>
                )}
                {gameState === 'finished' && (
                  <motion.div initial={{ opacity: 0.5, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }} className='w-full max-w-md'>
                    <button
                      onClick={newGame}
                      disabled={!canPlayAgain}
                      className='cursor-pointer w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest flex items-center justify-center gap-2'
                    >
                      <RefreshCw size={20} strokeWidth={3} />
                      Novo Jogo
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}