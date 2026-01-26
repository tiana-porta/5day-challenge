'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface HomeworkCardProps {
  children: ReactNode
  className?: string
}

export function HomeworkCard({ children, className = '' }: HomeworkCardProps) {
  return (
    <motion.div
      className={`backdrop-blur-xl bg-dark/70 border-2 border-primary/20 rounded-3xl p-6 md:p-8 shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
