"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Trophy, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

import { useAuth } from '../contexts/AuthContext'
import { LocalStorage, GameHistory } from '../lib/storage'
import { formatMoney, formatDate } from '../utils/maskUtils'

export const UserProfile = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useAuth()
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGameHistory = () => {
      if (!profile) return

      const data = LocalStorage.getGameHistoryForUser(profile.id, 20)
      setGameHistory(data)
      setLoading(false)
    }

    fetchGameHistory()
  }, [profile])

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'slots': return '🎰'
      case 'roulette': return '🎡'
      case 'blackjack': return '🃏'
      default: return '🎲'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.button
          variants={itemVariants}
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Voltar ao lobby
        </motion.button>

        <motion.div variants={itemVariants} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white">
              {profile?.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{profile?.username}</h1>
              <p className="text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-4">
            <motion.div variants={itemVariants} className="bg-slate-900/50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <TrendingUp className="text-amber-400" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-amber-400">
                    {formatMoney(profile?.balance ?? 0)}
                  </div>
                  <div className="text-slate-400 text-sm">Saldo Atual</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-slate-900/50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Trophy className="text-blue-400" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatMoney(profile?.total_won ?? 0)}
                  </div>
                  <div className="text-slate-400 text-sm">Total ganho</div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-slate-900/50 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="text-purple-400" size={24} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatMoney(profile?.total_wagered ?? 0)}
                  </div>
                  <div className="text-slate-400 text-sm">Total apostado</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Histórico de Jogos</h2>

          {loading ? (
            <div className="text-center text-slate-400 py-8">Carregando...</div>
          ) : gameHistory.length === 0 ? (
            <div className="text-center text-slate-400 py-8">Nenhum jogo jogado ainda. Comece a jogar para ver seu histórico!</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gameHistory.map((game) => {
                const profit = game.payout_amount - game.bet_amount
                const isWin = profit > 0
                const isPush = profit === 0 && game.payout_amount > 0

                return (
                  <div
                    key={game.id}
                    className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getGameIcon(game.game_type)}</span>
                        <div>
                          <div className="font-semibold text-white capitalize">
                            {game.game_type}
                          </div>
                          <div className="text-xs text-slate-400">
                            {formatDate(game.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-slate-400 text-sm">
                          Bet: {game.bet_amount}
                        </div>
                        <div className={`font-bold ${
                          isWin ? 'text-green-400' :
                          isPush ? 'text-blue-400' :
                          'text-red-400'
                        }`}>
                          {profit > 0 ? '+' : ''}{profit.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}