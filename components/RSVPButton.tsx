'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function getRSVPCount(): number {
  if (typeof window === 'undefined') return 0
  const stored = localStorage.getItem('rsvp_total')
  return stored ? parseInt(stored, 10) : 0
}

function incrementRSVP(): number {
  if (typeof window === 'undefined') return 0
  const current = getRSVPCount()
  const newCount = current + 1
  localStorage.setItem('rsvp_total', newCount.toString())
  return newCount
}

export function RSVPButton() {
  const [count, setCount] = useState(0)
  const [justRSVPed, setJustRSVPed] = useState(false)

  useEffect(() => {
    setCount(getRSVPCount())
  }, [])

  const handleRSVP = () => {
    const newCount = incrementRSVP()
    setCount(newCount)
    setJustRSVPed(true)
    setTimeout(() => setJustRSVPed(false), 2000)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.button
        onClick={handleRSVP}
        className="relative px-12 py-5 rounded-xl font-bold text-lg md:text-xl bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/50 transition-all duration-300 overflow-hidden group"
        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(250, 70, 22, 0.6)' }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative z-10 tracking-wider">RSVP Now</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut'
          }}
        />
      </motion.button>

      <motion.div
        className="backdrop-blur-xl bg-dark/70 border-2 border-primary/20 rounded-3xl p-6 shadow-lg min-w-[200px] text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-sm text-primary/70 mb-2">RSVPs</div>
        <motion.div
          key={count}
          className="text-4xl md:text-5xl font-black text-accent"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {count}
        </motion.div>
        {justRSVPed && (
          <motion.div
            className="text-sm text-accent mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            ✓ You're in!
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

