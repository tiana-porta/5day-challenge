'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import Link from 'next/link'

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
      <div className="relative z-10 max-w-3xl mx-auto w-full">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-6">
            Day 2 of 5
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primary mb-6 tracking-tight">
            <span className="block">Whop University:</span>
            <span className="block text-accent mt-2">Market Research</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary/70 font-light max-w-xl mx-auto">
            Complete your Day 2 homework to move forward in the challenge.
          </p>
        </motion.div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link href="/experiences/day2/homework/day-2">
            <motion.button
              className="relative px-12 py-5 rounded-xl font-bold text-lg md:text-xl bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/50 transition-all duration-300 overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(250, 70, 22, 0.6)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 tracking-wider">Submit Homework</span>
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
          </Link>
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
