'use client'

import { motion } from 'framer-motion'
import { StoreLinkForm } from '@/components/homework/StoreLinkForm'

export const dynamic = 'force-dynamic'

export default function Day4HomeworkPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden px-4 py-12">
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
        {/* Back link */}
        <motion.a
          href="/"
          className="inline-flex items-center gap-2 text-primary/70 hover:text-primary mb-8 transition-colors duration-300"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Challenge
        </motion.a>

        {/* Page header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-black text-primary mb-2">
            <span className="text-accent">Whop University</span>
          </h1>
          <p className="text-lg text-primary/70">5 Day Challenge Homework</p>
        </motion.div>

        {/* Store Link form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StoreLinkForm dayNumber={4} />
        </motion.div>
      </div>
    </div>
  )
}
