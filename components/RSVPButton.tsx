'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

async function getRSVPCount(): Promise<number> {
  try {
    const response = await fetch('/api/rsvp')
    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error('Error fetching RSVP count:', error)
    return 0
  }
}

async function incrementRSVP(): Promise<number> {
  try {
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    const data = await response.json()
    return data.count || 0
  } catch (error) {
    console.error('Error incrementing RSVP:', error)
    return 0
  }
}

export function RSVPButton() {
  const [count, setCount] = useState(0)
  const [justRSVPed, setJustRSVPed] = useState(false)

  useEffect(() => {
    // Fetch initial count from API
    const fetchCount = async () => {
      const initialCount = await getRSVPCount()
      setCount(initialCount)
    }
    fetchCount()

    // Poll for updates every 5 seconds to get real-time count from other users
    const interval = setInterval(async () => {
      const updatedCount = await getRSVPCount()
      setCount(updatedCount)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRSVP = async () => {
    // Increment RSVP count when button is clicked
    try {
      const newCount = await incrementRSVP()
      setCount(newCount)
      setJustRSVPed(true)
    } catch (error) {
      console.error('Error recording RSVP:', error)
    }
    
    // Redirect to Whop checkout page
    window.location.href = 'https://whop.com/checkout/plan_6qlhHFelOu6cx'
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

