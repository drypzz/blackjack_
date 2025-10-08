'use client'

import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, UserPlus, AtSign, Lock, AlertTriangle, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthInput = forwardRef<HTMLInputElement, any>(({ icon, ...props }, ref) => (
  <div className="relative border border-slate-600 rounded-lg transition-colors focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/50">
    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
      {icon}
    </span>
    <input
      ref={ref}
      {...props}
      className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none text-white placeholder-slate-500"
    />
  </div>
));

const Spinner = () => (
  <motion.div
    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
);


export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Nome de usuário é obrigatório');
        }
        await signUp(email, password, username);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
            Royal Casino
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Bem-vindo de volta!' : 'Junte-se à emoção'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence>
            {!isLogin && (
              <motion.div
                key="username"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '16px' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <AuthInput
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                  placeholder="Escolha um nome de usuário"
                  required={!isLogin}
                  icon={<User size={18} className="text-slate-500" />}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AuthInput
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            icon={<AtSign size={18} className="text-slate-500" />}
          />

          <AuthInput
            id="password"
            type="password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            icon={<Lock size={18} className="text-slate-500" />}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-2 rounded-lg text-sm"
              >
                <AlertTriangle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-amber-500/30"
          >
            {loading ? (
              <Spinner />
            ) : isLogin ? (
              <>
                <LogIn size={20} />
                Conectar-se
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Registrar-se
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors hover:underline"
          >
            {isLogin ? "Não tem uma conta? Registrar-se" : 'Já tem uma conta? Conectar-se'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}