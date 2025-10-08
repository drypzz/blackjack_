import { motion } from 'framer-motion'

export const ConfettiComponent = () => {
   const colors = ['#fde047', '#f97316', '#10b981', '#3b82f6', '#ec4899']
   const confetti = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: Math.random() * 100,
      y: Math.random() * -150 - 50,
      rotate: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 3 + 4,
      delay: Math.random() * 2,
   }))

  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none z-10'>
      {confetti.map(c => (
         <motion.div
            key={c.id}
            className='absolute rounded-full'
            style={{
               backgroundColor: c.color,
               left: `${c.x}%`,
               width: `${c.scale * 12}px`,
               height: `${c.scale * 12}px`
            }}
            initial={{ y: c.y, opacity: 0 }}
            animate={{ y: '120vh', rotate: c.rotate, opacity: [1, 1, 0] }}
            transition={{ duration: c.duration, delay: c.delay, ease: 'linear', repeat: Infinity }}
         />
      ))}
    </div>
  )
}