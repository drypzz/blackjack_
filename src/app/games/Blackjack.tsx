"use client"

import { useState } from 'react'
import { Spade, ArrowLeft, Heart, Diamond, Club } from 'lucide-react'
import { motion, AnimatePresence, Variants } from 'framer-motion'

import { useAuth } from '@/app/contexts/AuthContext'
import { LocalStorage } from '@/app/lib/storage'
import { formatMoney } from '@/app/utils/maskUtils'

type Card = {
  suit: string
  value: string
  numValue: number
}
type GameState = 'betting' | 'playing' | 'dealer-turn' | 'finished'
const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export const Blackjack = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth()
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [betAmount, setBetAmount] = useState(10)
  const [gameState, setGameState] = useState<GameState>('betting')
  const [message, setMessage] = useState('')

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

  const dealInitialCards = () => {
    if (!profile || betAmount > profile.balance) {
      setMessage('Saldo insuficiente!')
      return
    }
    if (betAmount < 1) {
      setMessage('Aposta mínima é 1 crédito')
      return
    }
    const newDeck = createDeck()
    const player = [newDeck.pop()!, newDeck.pop()!]
    const dealer = [newDeck.pop()!, newDeck.pop()!]

    setDeck(newDeck)
    setPlayerHand(player)
    setDealerHand(dealer)
    setGameState('playing')
    setMessage('')

    if (calculateScore(player) === 21) {
      setGameState('dealer-turn')
      setTimeout(() => {
        setGameState('finished')
        finishGame(player, dealer, true)
      }, 1000)
    }
  }

  const hit = () => {
    if (gameState !== 'playing' || !deck.length) return
    const newCard = deck.pop()!
    const newHand = [...playerHand, newCard]
    setPlayerHand(newHand)
    setDeck([...deck])
    const score = calculateScore(newHand)
    if (score > 21) {
      setGameState('finished')
      finishGame(newHand, dealerHand)
    } else if (score === 21) {
      stand(newHand)
    }
  }

  const stand = (currentHand?: Card[]) => {
    const hand = currentHand || playerHand
    setGameState('dealer-turn')

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
        setGameState('finished')
        finishGame(hand, newDealerHand)
      }
    }
    setTimeout(dealerPlay, 500)
  }

  const finishGame = async (pHand: Card[], dHand: Card[], blackjack = false) => {
    const playerScore = calculateScore(pHand)
    const dealerScore = calculateScore(dHand)
    let payout = 0
    let msg = ''

    if (playerScore > 21) {
      msg = 'Estourou! Você perdeu.'
    } else if (blackjack) {
      payout = betAmount * 2.5
      msg = 'Blackjack! Você ganhou!'
    } else if (dealerScore > 21) {
      payout = betAmount * 2
      msg = 'O dealer estourou! Você ganhou!'
    } else if (playerScore > dealerScore) {
      payout = betAmount * 2
      msg = 'Você ganhou!'
    } else if (playerScore < dealerScore) {
      msg = 'O dealer ganhou. Você perdeu.'
    } else {
      payout = betAmount
      msg = 'Empate! Aposta devolvida.'
    }

    setMessage(msg)

    if (profile) {
      const newBalance = profile.balance - betAmount + payout
      await LocalStorage.updateProfile(profile.id, {
        balance: newBalance,
        total_wagered: profile.total_wagered + betAmount,
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
    }
  }

  const newGame = () => {
    setGameState('betting')
    setPlayerHand([])
    setDealerHand([])
    setDeck([])
    setMessage('')
  }

  const SuitIcon = ({ suit, className, size }: { suit: string, className?: string, size?: number }) => {
    switch (suit) {
      case '♠': return <Spade className={className} size={size} />
      case '♥': return <Heart className={className} size={size} />
      case '♦': return <Diamond className={className} size={size} />
      case '♣': return <Club className={className} size={size} />
      default: return null
    }
  }

  const renderCard = (card: Card | null, hidden = false) => {
    if (hidden || !card) {
      return (
        <div className="w-24 h-36 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg border-2 border-slate-600 flex items-center justify-center shadow-lg transform perspective-1000">
          <Spade className="text-slate-600/50" size={48} strokeWidth={1.5} />
        </div>
      )
    }
    const isRed = ['♥', '♦'].includes(card.suit)
    const cardColor = isRed ? 'text-red-600' : 'text-slate-900'
    return (
      <div className="w-24 h-36 bg-slate-50 rounded-lg border border-slate-300 flex flex-col items-center justify-center p-2 shadow-lg relative perspective-1000">
        <div className="absolute top-1 left-2 text-left">
          <div className={`text-2xl font-bold ${cardColor}`}>{card.value}</div>
          <SuitIcon suit={card.suit} className={cardColor} />
        </div>
        <div className="absolute center">
          <SuitIcon suit={card.suit} className={`${cardColor} opacity-80`} size={48} />
        </div>
        <div className="absolute bottom-1 right-2 text-right transform rotate-180">
          <div className={`text-2xl font-bold ${cardColor}`}>{card.value}</div>
          <SuitIcon suit={card.suit} className={cardColor} />
        </div>
      </div>
    )
  }

  const cardVariants = {
    initial: { y: -50, opacity: 0, rotate: -15, scale: 0.9 },
    animate: {
      y: 0,
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { y: 50, opacity: 0, scale: 0.9 }
  } as const

  const handVariants: Variants = {
    animate: {
      transition: { staggerChildren: 0.15 }
    }
  }

  const messageColor = message.toLowerCase().includes('win')
    ? 'text-emerald-400'
    : (message.toLowerCase().includes('lose') || message.toLowerCase().includes('bust'))
      ? 'text-red-500'
      : 'text-slate-300'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 p-4 md:p-6 text-white font-sans">
      <div className="max-w-5xl mx-auto">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md">
          <ArrowLeft size={20} /> Voltar ao Lobby
        </button>
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-3 tracking-wider">
              <Spade size={32} /> Blackjack
            </h1>
            <p className="text-slate-400">Seu Saldo: <span className="font-bold text-amber-300">{formatMoney(profile?.balance ?? 0)}</span></p>
          </div>
          {gameState === 'betting' ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-sm mx-auto">
              <div>
                <label className="block text-slate-300 mb-2 text-center text-lg">Valor da Aposta: <span className="font-bold text-amber-400 text-xl">{formatMoney(betAmount)}</span></label>
                <input
                  type="range"
                  min="10"
                  max={Math.max(10, profile?.balance ?? 10)}
                  step="10"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
              <button
                onClick={dealInitialCards}
                disabled={!profile || betAmount > (profile?.balance || 0)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest"
              >
                Quatindade
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="bg-green-900/20 rounded-t-full border-4 border-amber-800/50 p-6 min-h-[220px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-300">Mão do Dealer</h3>
                  {gameState === 'finished' && (
                    <span className="text-lg text-amber-400 font-semibold bg-slate-900/50 px-3 py-1 rounded-md">
                      Pontuação: {calculateScore(dealerHand)}
                    </span>
                  )}
                </div>
                <motion.div variants={handVariants} initial="initial" animate="animate" className="flex gap-3 flex-wrap justify-center items-center min-h-[144px]">
                  {dealerHand.map((card, index) => (
                    <motion.div key={`dealer-${index}`} variants={cardVariants}>
                      {renderCard(card, index === 1 && gameState !== 'finished' && gameState !== 'dealer-turn')}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <div className="bg-green-900/20 rounded-b-full border-4 border-amber-800/50 p-6 min-h-[220px]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-slate-300">Sua Mão</h3>
                  <span className="text-lg text-amber-400 font-semibold bg-slate-900/50 px-3 py-1 rounded-md">
                    Pontuação: {calculateScore(playerHand)}
                  </span>
                </div>
                <motion.div variants={handVariants} initial="initial" animate="animate" className="flex gap-3 flex-wrap justify-center items-center min-h-[144px]">
                  {playerHand.map((card, index) => (
                    <motion.div key={`player-${index}`} variants={cardVariants}>
                      {renderCard(card)}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
              <div className="h-24 flex flex-col items-center justify-center">
                <AnimatePresence>
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`text-center text-2xl font-bold py-3 ${messageColor}`}
                    >
                      {message}
                    </motion.div>
                  )}
                </AnimatePresence>
                {gameState === 'playing' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.5 } }} className="flex gap-4 w-full max-w-md">
                    <button onClick={hit} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider">Pegar</button>
                    <button onClick={() => stand()} className="flex-1 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider">FIcar</button>
                  </motion.div>
                )}
                {gameState === 'finished' && (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }} className="w-full max-w-md">
                    <button onClick={newGame} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider">Novo Jogo</button>
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