"use client"

import { useState } from 'react'
import { motion, AnimatePresence, AnimationGeneratorType, easeInOut } from 'framer-motion'
import { Sparkles, CircleDot, Spade, LogOut, User, Coins } from 'lucide-react'

import { UserProfile } from './UserProfile'
import { useAuth } from '../contexts/AuthContext'
import { SlotMachine } from '../games/SlotMachine'
import { Roulette } from '../games/Roulette'
import { Blackjack } from '../games/Blackjack'
import { formatMoney } from '../utils/maskUtils'

type GameType = 'lobby' | 'slots' | 'roulette' | 'blackjack' | 'profile'

export const CasinoLobby = () => {
  const { profile, signOut } = useAuth()
  const [currentGame, setCurrentGame] = useState<GameType>('lobby')

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
  }

  const pageTransition = {
    type: "tween" as AnimationGeneratorType,
    ease: easeInOut,
    duration: 0.5,
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }


  const renderContent = () => {
    switch (currentGame) {
      case 'slots':
        return <SlotMachine onBack={() => setCurrentGame('lobby')} />
      case 'roulette':
        return <Roulette onBack={() => setCurrentGame('lobby')} />
      case 'blackjack':
        return <Blackjack onBack={() => setCurrentGame('lobby')} />
      case 'profile':
        return <UserProfile onBack={() => setCurrentGame('lobby')} />
      case 'lobby':
      default:
        return (
          <motion.div
            key="lobby-main"
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            variants={containerVariants}
          >
            <main className="max-w-7xl mx-auto px-6 py-12">
              <motion.div variants={itemVariants} className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-3">Escolha seu jogo</h2>
                <p className="text-slate-400 text-lg">Tente a sorte em nossos jogos de cassino premium</p>
              </motion.div>

              <motion.div
                variants={containerVariants}
                className="grid md:grid-cols-3 gap-8 mb-12"
              >
                <motion.button
                  variants={itemVariants}
                  onClick={() => setCurrentGame('slots')}
                  className="group relative bg-gradient-to-br from-slate-800/80 cursor-pointer to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 rounded-2xl transition-all"></div>
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Slot Machine</h3>
                    <p className="text-slate-400 mb-4">Combine 3 símbolos para ganhar muito!</p>
                    <div className="text-amber-400 font-semibold">Até 10x de pagamento</div>
                  </div>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  onClick={() => setCurrentGame('roulette')}
                  className="group relative bg-gradient-to-br from-slate-800/80 cursor-pointer to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 rounded-2xl transition-all"></div>
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <CircleDot size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Roleta</h3>
                    <p className="text-slate-400 mb-4">Aposte em cores, probabilidades ou faixas</p>
                    <div className="text-amber-400 font-semibold">2x de pagamento</div>
                  </div>
                </motion.button>

                <motion.button
                  variants={itemVariants}
                  onClick={() => setCurrentGame('blackjack')}
                  className="group relative bg-gradient-to-br from-slate-800/80 cursor-pointer to-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border-2 border-slate-700 hover:border-amber-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/10 group-hover:to-orange-500/10 rounded-2xl transition-all"></div>
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Spade size={40} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Blackjack</h3>
                    <p className="text-slate-400 mb-4">Derrote o dealer até 21</p>
                    <div className="text-amber-400 font-semibold">Até 2.5x de pagamento</div>
                  </div>
                </motion.button>
              </motion.div>

              <motion.div
                variants={containerVariants}
                className="grid md:grid-cols-3 gap-6 text-center"
              >
                <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
                  <div className="text-3xl font-bold text-amber-400 mb-2">
                    {formatMoney(profile?.total_wagered ?? 0)}
                  </div>
                  <div className="text-slate-400">Total Apostado</div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {formatMoney(profile?.total_won ?? 0)}
                  </div>
                  <div className="text-slate-400">Total Ganho</div>
                </motion.div>
                <motion.div variants={itemVariants} className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl border border-slate-700">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {profile ? ((profile.total_won / (profile.total_wagered || 1)) * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-slate-400">Taxa de Vitória</div>
                </motion.div>
              </motion.div>
            </main>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <div className="relative">
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-2">

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                  Royal Casino
                </h1>
                <p className="hidden sm:block text-slate-400 text-sm mt-1">Bem-vindo, {profile?.username}</p>
              </div>

              <div className="flex items-center gap-2 sm:gap-4">

                <div className="bg-slate-800/80 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <Coins className="text-amber-400" size={20} />
                    <div>
                      <div className="hidden sm:block text-xs text-slate-400 leading-tight">Saldo</div>
                      <div className="text-base sm:text-lg font-bold text-amber-400 leading-tight">
                        {formatMoney(profile?.balance ?? 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setCurrentGame('profile')}
                    className="p-2 sm:p-3 hover:bg-slate-700/80 rounded-l-xl transition-colors cursor-pointer"
                    title="Ver Perfil"
                  >
                    <User size={20} className="text-slate-300" />
                  </button>

                  <div className="w-px h-6 bg-slate-700"></div>

                  <button
                    onClick={handleSignOut}
                    className="p-2 sm:p-3 hover:bg-red-900/50 rounded-r-xl transition-colors cursor-pointer"
                    title="Sair"
                  >
                    <LogOut size={20} className="text-red-400" />
                  </button>
                </div>

              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentGame}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}