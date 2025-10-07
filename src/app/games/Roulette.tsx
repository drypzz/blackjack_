"use client"

import { useState } from "react"
import { CircleDot, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useAuth } from "../contexts/AuthContext"
import { LocalStorage } from "../lib/storage"
import { formatMoney } from "../utils/maskUtils"

const ROULETTE_NUMBERS = [
  { num: 0, color: "green" }, { num: 32, color: "red" }, { num: 15, color: "black" },
  { num: 19, color: "red" }, { num: 4, color: "black" }, { num: 21, color: "red" },
  { num: 2, color: "black" }, { num: 25, color: "red" }, { num: 17, color: "black" },
  { num: 34, color: "red" }, { num: 6, color: "black" }, { num: 27, color: "red" },
  { num: 13, color: "black" }, { num: 36, color: "red" }, { num: 11, color: "black" },
  { num: 30, color: "red" }, { num: 8, color: "black" }, { num: 23, color: "red" },
  { num: 10, color: "black" }, { num: 5, color: "red" }, { num: 24, color: "black" },
  { num: 16, color: "red" }, { num: 33, color: "black" }, { num: 1, color: "red" },
  { num: 20, color: "black" }, { num: 14, color: "red" }, { num: 31, color: "black" },
  { num: 9, color: "red" }, { num: 22, color: "black" }, { num: 18, color: "red" },
  { num: 29, color: "black" }, { num: 7, color: "red" }, { num: 28, color: "black" },
  { num: 12, color: "red" }, { num: 35, color: "black" }, { num: 3, color: "red" },
  { num: 26, color: "black" },
]

type BetType = "red" | "black" | "even" | "odd" | "low" | "high" | null

export const Roulette = ({ onBack }: { onBack: () => void }) => {
  const { profile, refreshProfile } = useAuth()
  const [spinning, setSpinning] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [betType, setBetType] = useState<BetType>(null)
  const [result, setResult] = useState<typeof ROULETTE_NUMBERS[0] | null>(null)
  const [message, setMessage] = useState("")
  const [rotation, setRotation] = useState(0)

  const spin = async () => {
    if (!profile || spinning || !betType) return
    if (betAmount > profile.balance) {
      setMessage("Saldo insuficiente!")
      return
    }
    if (betAmount < 1) {
      setMessage("Aposta mínima é 1 crédito")
      return
    }

    setSpinning(true)
    setMessage("Girando a roleta...")
    setResult(null)

    const randomResult =
      ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)]
    const winningIndex = ROULETTE_NUMBERS.findIndex(n => n.num === randomResult.num)

    const baseSpins = 5 * 360
    const anglePerSegment = 360 / ROULETTE_NUMBERS.length
    const winningAngle = winningIndex * anglePerSegment
    const randomOffset = (Math.random() - 0.5) * anglePerSegment * 0.8
    const finalRotation = baseSpins - winningAngle + randomOffset

    setRotation(rotation + finalRotation)

    setTimeout(async () => {
      setResult(randomResult)
      let won = false
      let payout = 0
      if (betType === "red" && randomResult.color === "red") won = true
      else if (betType === "black" && randomResult.color === "black") won = true
      else if (betType === "even" && randomResult.num !== 0 && randomResult.num % 2 === 0) won = true
      else if (betType === "odd" && randomResult.num !== 0 && randomResult.num % 2 === 1) won = true
      else if (betType === "low" && randomResult.num >= 1 && randomResult.num <= 18) won = true
      else if (betType === "high" && randomResult.num >= 19 && randomResult.num <= 36) won = true

      if (won) {
        payout = betAmount * 2
        setMessage(`Você ganhou! Caiu em ${randomResult.num} (${randomResult.color})`)
      } else {
        setMessage(`Você perdeu! Caiu em ${randomResult.num} (${randomResult.color})`)
      }

      const newBalance = profile.balance - betAmount + payout
      await LocalStorage.updateProfile(profile.id, {
        balance: newBalance,
        total_wagered: profile.total_wagered + betAmount,
        total_won: profile.total_won + payout,
      })
      await LocalStorage.addGameHistory({
        user_id: profile.id,
        game_type: "roulette",
        bet_amount: betAmount,
        payout_amount: payout,
        game_data: { result: randomResult, betType },
      })
      refreshProfile()
      setSpinning(false)
    }, 4500)
  }

  const betButtons = [
    { type: "red" as BetType, label: "Vermelho", color: "from-red-500 to-red-700" },
    { type: "black" as BetType, label: "Preto", color: "from-slate-800 to-slate-900" },
    { type: "even" as BetType, label: "Par", color: "from-blue-600 to-blue-800" },
    { type: "odd" as BetType, label: "Ímpar", color: "from-blue-600 to-blue-800" },
    { type: "low" as BetType, label: "1–18", color: "from-emerald-600 to-emerald-700" },
    { type: "high" as BetType, label: "19–36", color: "from-emerald-600 to-emerald-700" },
  ]

  const anglePerItem = 360 / ROULETTE_NUMBERS.length

  const messageColor =
    message.toLowerCase().includes("ganhou") ? "text-emerald-400" :
    message.toLowerCase().includes("perdeu") ? "text-red-500" :
    "text-slate-300"

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 p-4 md:p-6 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 shadow-md"
        >
          <ArrowLeft size={20} /> Voltar ao Lobby
        </button>

        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-slate-700 p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-amber-400 mb-2 flex items-center justify-center gap-3 tracking-wider">
              <CircleDot size={32} /> Roleta
            </h1>
            <p className="text-slate-400">
              {`Saldo: `}
              <span className="font-bold text-amber-300">
                {formatMoney(profile?.balance ?? 0)}
              </span>
            </p>
          </div>

          <div className="flex justify-center items-center mb-10">
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
                        color === "red"
                          ? "bg-red-600"
                          : color === "black"
                          ? "bg-slate-800"
                          : "bg-green-600"
                      }`}
                    >
                      <span
                        style={{
                          transform: `rotate(${anglePerItem / 2}deg) translateY(-2px)`,
                        }}
                      >
                        {num}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="absolute inset-8 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-amber-500"></div>
                </div>
              </motion.div>
            </div>
          </div>

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

          <div className="space-y-6 max-w-sm mx-auto">
            <div>
              <label className="block text-slate-300 mb-2 text-center text-lg">
                Valor da Aposta:{" "}
                <span className="font-bold text-amber-400 text-xl">
                  {formatMoney(betAmount)}
                </span>
              </label>
              <input
                type="range"
                min="1"
                max={Math.min(100, profile?.balance || 0)}
                value={betAmount}
                onChange={e => setBetAmount(Number(e.target.value))}
                disabled={spinning}
                className="w-full h-3 bg-slate-700 rounded-lg accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-3 text-center text-lg">
                Escolha sua aposta:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {betButtons.map(btn => (
                  <button
                    key={btn.type}
                    onClick={() => setBetType(btn.type)}
                    disabled={spinning}
                    className={`py-3 px-4 font-bold rounded-xl text-white uppercase tracking-wider shadow-md transition-all duration-200
                      bg-gradient-to-r ${btn.color}
                      ${
                        betType === btn.type
                          ? "ring-2 ring-amber-400 scale-105"
                          : "opacity-80 hover:opacity-100"
                      }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={spin}
              disabled={spinning || !profile || !betType || betAmount > (profile?.balance || 0)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-slate-600 disabled:to-slate-600 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-amber-500/30 text-xl uppercase tracking-widest"
            >
              {spinning
                ? "GIRANDO..."
                : betType
                ? `Apostar em ${betType.toUpperCase()}`
                : "Selecione um tipo de aposta"}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
