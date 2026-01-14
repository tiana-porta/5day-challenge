'use client'

import { motion } from 'framer-motion'
import { CountdownTimer } from '@/components/CountdownTimer'
import { RSVPButton } from '@/components/RSVPButton'

export default function Home() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(250, 70, 22, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(250, 70, 22, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} 
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" 
        style={{ animationDelay: '1s' }} 
      />

      {/* Main content */}
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-primary mb-6 tracking-tight">
            <span className="block">Whop University:</span>
            <span className="block text-accent mt-2">5 Day Challenge</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 font-light">
            Join us for a 5-day build sprint live.
          </p>
        </motion.div>

        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <CountdownTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <RSVPButton />
        </motion.div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-accent/30 hidden md:block" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-accent/30 hidden md:block" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-accent/30 hidden md:block" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-accent/30 hidden md:block" />
      </div>
    </div>
  )
}
