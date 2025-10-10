'use client'

import { CircleUser } from 'lucide-react'
import { motion } from 'framer-motion'

import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string) => {
   const [matches, setMatches] = useState(false)

   useEffect(() => {
      if (typeof window !== 'undefined') {
         const media = window.matchMedia(query)
         if (media.matches !== matches) {
            setMatches(media.matches)
         }
         const listener = () => {
            setMatches(media.matches)
         }
         media.addEventListener('change', listener)

         return () => media.removeEventListener('change', listener)
      }
   }, [matches, query])

   return matches
}

export function Footer() {
   const socialLinks = [
      { icon: <CircleUser size={24} />, href: 'https://github.com/drypzz', name: 'Drypzz' },
      { icon: <CircleUser size={24} />, href: 'https://github.com/Felipe-G-Schmitt', name: 'Felipe-G-Schmitt' },
      { icon: <CircleUser size={24} />, href: 'https://github.com/function404', name: 'Function404' },
   ]

   const isMobile = useMediaQuery('(max-width: 768px)')

   const footerVariants = {
      hidden: { opacity: 0, y: 50 },
      visible: {
         opacity: 1,
         y: 0,
         transition: {
            staggerChildren: 0.2,
         },
      },
   }

   const itemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
   }

   const nameVariants = {
      rest: { opacity: 0, x: -10, width: 0, marginLeft: 0 },
      hover: { opacity: 1, x: 0, width: 'auto', marginLeft: '8px', transition: { staggerChildren: 0.2 } },
      visible: { opacity: 1, x: 0, width: 'auto', marginLeft: '8px' },
   }

   return (
      <motion.footer
         className="bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-xl border-t border-slate-700 mt-auto py-8 px-6 text-white"
         variants={footerVariants}
         initial="hidden"
         whileInView="visible"
         viewport={{ once: true, amount: 0.5 }}
      >
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:text-left">
            <motion.div variants={itemVariants}>
               <h3 className="text-xl font-bold text-amber-400 mb-4">MZK2 Bet</h3>
               <p className="text-slate-400">
                  Seu portal para a emoção dos jogos de cassino online. Jogue com responsabilidade.
               </p>
            </motion.div>
            <motion.div variants={itemVariants}>
               <h3 className="text-lg font-semibold text-white mb-4">Links Rápidos</h3>
               <ul className="space-y-2">
                  <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Início</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Sobre Nós</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Contato</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-amber-400 transition-colors">Termos de Serviço</a></li>
               </ul>
            </motion.div>
            <motion.div variants={itemVariants}>
               <h3 className="text-lg font-semibold text-white mb-4">Siga os devs</h3>
               <div className="flex flex-col md:items-start space-y-3">
                  {socialLinks.map((link, index) => (
                     <motion.a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial="rest"
                        whileHover={!isMobile ? "hover" : ""}
                        animate={isMobile ? "visible" : "rest"}
                        className="flex items-center text-slate-400 hover:text-amber-400 transition-colors"
                     >
                        <motion.div whileHover={{ scale: 1.2, rotate: 10 }} whileTap={{ scale: 0.9 }}>
                           {link.icon}
                        </motion.div>
                        
                        <motion.span
                           variants={nameVariants}
                           className="overflow-hidden whitespace-nowrap font-medium"
                        >
                           {link.name}
                        </motion.span>
                     </motion.a>
                  ))}
               </div>
            </motion.div>
         </div>
         <motion.div
            className="text-center text-slate-500 mt-8 pt-8 border-t border-slate-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
         >
            <p>&copy; {new Date().getFullYear()} MZK2 Bet. Todos os direitos reservados.</p>
         </motion.div>
      </motion.footer>
   )
}