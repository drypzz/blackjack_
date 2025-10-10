'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Trophy, Coins, History, FileText, Sparkles, CircleDot, Spade, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

import { useAuth } from '../contexts/AuthContext'
import { LocalStorage, GameHistory } from '../lib/storage'
import { formatMoney, formatDate } from '../utils/maskUtils'

const HistoryItem = ({ game }: { game: GameHistory }) => {
  const profit = game.payout_amount - game.bet_amount
  const isWin = profit > 0
  const isPush = profit === 0 && game.payout_amount > 0

  const icons: { [key: string]: React.ReactNode } = {
    slots: <Sparkles size={24} className="text-amber-400" />,
    roleta: <CircleDot size={24} className="text-red-400" />,
    blackjack: <Spade size={24} className="text-blue-400" />,
  }

  const colors = {
    win: 'text-green-400 border-green-500/30 bg-green-500/10',
    loss: 'text-red-400 border-red-500/30 bg-red-500/10',
    push: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  }

  const gameStatus = isWin ? 'win' : isPush ? 'push' : 'loss'

  return (
    <div className={`p-3 sm:p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${colors[gameStatus]}`}>
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${colors[gameStatus]}`}>
          {icons[game.game_type]}
        </div>
        <div>
          <div className="font-bold text-white capitalize text-base sm:text-lg">
            {game.game_type}
          </div>
          <div className="text-xs text-slate-400">
            {formatDate(game.created_at)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:gap-8 items-center text-center sm:text-right">
        <div>
          <div className="text-slate-400 text-xs sm:text-sm">Aposta</div>
          <div className='text-sm sm:text-base text-white font-semibold'>{formatMoney(game.bet_amount)}</div>
        </div>
        <div className='text-right'>
          <div className="text-slate-400 text-xs sm:text-sm">Lucro</div>
          <div className={`font-bold text-sm sm:text-base ${isWin ? 'text-green-400' : isPush ? 'text-blue-400' : 'text-red-400'}`}>
            {profit >= 0 ? '+' : ''}{formatMoney(profit)}
          </div>
        </div>
        <div>
          <div className="text-slate-400 text-xs sm:text-sm">Total</div>
          <div className='text-sm sm:text-base text-white font-semibold'>{formatMoney(game.payout_amount)}</div>
        </div>
      </div>
    </div>
  )
}

type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: string | number
  colorClass: string
}

const achievementList: { [key: string]: { name: string, description: string } } = {
  "sobreviveu_50": { name: "Sobrevivente", description: "Sobreviveu por 50 rodadas." },
  "quebrou_rapido": { name: "azarado", description: "Foi à falência em menos de 10 rodadas." },
  "multiplicador_2x": { name: "sortudo", description: "Conseguiu um multiplicador 2x na Roleta." },
}

const StatCard = ({ icon, label, value, colorClass }: StatCardProps) => (
  <div className="bg-slate-900/50 p-4 rounded-xl flex items-center gap-4">
    <div className={`p-3 rounded-lg ${colorClass}/20`}>
      {icon}
    </div>
    <div>
      <div className={`text-xl sm:text-2xl font-bold ${colorClass}`}>{value}</div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  </div>
)

export const UserProfile = ({ onBack }: { onBack: () => void }) => {
  const { profile } = useAuth()
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) {
      const history = LocalStorage.getGameHistoryForUser(profile.id)
      setGameHistory(history)
      setLoading(false)
    }
  }, [profile])


  const exportToCSV = () => {
    let csvContent = "data:text/csvcharset=utf-8,"
    csvContent += "ID,Tipo de Jogo,Valor da Aposta,Pagamento,Data\n"

    gameHistory.forEach(game => {
      const row = [game.id, game.game_type, game.bet_amount, game.payout_amount, formatDate(game.created_at)].join(",")
      csvContent += row + "\r\n"
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "historico_cassino.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (profile) {
      setGameHistory(LocalStorage.getGameHistoryForUser(profile.id, 20))
      setLoading(false)
    }
  }, [profile])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } },
  }

  const netProfit = (profile?.total_won ?? 0) - (profile?.total_wagered ?? 0)
  const winRate = profile?.total_wagered ? ((profile.total_won / profile.total_wagered) * 100).toFixed(1) + '%' : 'N/A'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 text-white">
      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.button
          variants={itemVariants}
          onClick={onBack}
          className="mb-6 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft size={20} />
          Voltar ao lobby
        </motion.button>

        <motion.div variants={itemVariants} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {profile?.username.charAt(0).toUpperCase()}
            </div>
            <div className='text-center sm:text-left'>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{profile?.username}</h1>
              <p className="text-slate-400">{profile?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
            <motion.div variants={itemVariants}>
              <StatCard icon={<Coins className="text-amber-400" size={24} />} label="Saldo Atual" value={formatMoney(profile?.balance ?? 0)} colorClass="text-amber-400" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<Trophy className="text-green-400" size={24} />} label="Lucro Líquido" value={formatMoney(netProfit)} colorClass={netProfit >= 0 ? "text-green-400" : "text-red-400"} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<TrendingUp className="text-blue-400" size={24} />} label="Taxa de Retorno" value={winRate} colorClass="text-blue-400" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard icon={<History className="text-purple-400" size={24} />} label="Jogos Jogados" value={gameHistory.length} colorClass="text-purple-400" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-6 sm:p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Evolução do Saldo</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={gameHistory.slice().reverse()} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="created_at" tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Line type="monotone" dataKey="balance_after" name="Saldo" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>


        {/* Conquistas */}
        <motion.div variants={itemVariants} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-6 sm:p-8 mb-6">
          <div className='flex items-center gap-3 mb-6'>
            <Trophy size={24} className='text-slate-300' />
            <h2 className="text-2xl font-bold text-white">Conquistas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {profile?.achievements?.map(ach => (
              <div key={ach} className="bg-slate-900/50 p-4 rounded-xl flex items-center gap-4 border border-amber-500/30">
                <Trophy className="text-amber-400" size={24} />
                <div>
                  <div className="font-bold text-white">{achievementList[ach]?.name || ach}</div>
                  <div className="text-slate-400 text-sm">{achievementList[ach]?.description}</div>
                </div>
              </div>
            ))}
            {(!profile?.achievements || profile.achievements.length === 0) && (
              <div className="text-center text-slate-400 col-span-full">Nenhuma conquista ainda.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-6 sm:p-8">
          <div className='flex items-center justify-between mb-6'>
            <div className="flex items-center gap-3">
              <FileText size={24} className='text-slate-300' />
              <h2 className="text-2xl font-bold text-white">Histórico de Jogos Recentes</h2>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download size={20} />
              Exportar CSV
            </button>
          </div>

          <AnimatePresence>
            {loading ? (
              <div className="text-center text-slate-400 py-8">Carregando...</div>
            ) : gameHistory.length === 0 ? (
              <div className="text-center text-slate-400 py-8">Nenhum jogo jogado ainda.</div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {gameHistory.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <HistoryItem game={game} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}