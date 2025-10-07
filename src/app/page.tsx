"use client";

import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { CasinoLobby } from './components/CasinoLobby';
import { motion } from 'framer-motion';

export default function Page() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 border-4 border-t-amber-500 border-slate-700 rounded-full"
        />
      </div>
    );
  }

  return user ? <CasinoLobby /> : <Auth />;
}