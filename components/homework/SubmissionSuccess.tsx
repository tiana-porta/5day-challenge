'use client'

import { motion } from 'framer-motion'
import { HomeworkCard } from './HomeworkCard'

interface SubmissionSuccessProps {
  dayNumber: number
  onBackToChallenge?: () => void
}

export function SubmissionSuccess({ dayNumber, onBackToChallenge }: SubmissionSuccessProps) {
  return (
    <HomeworkCard className="text-center max-w-lg mx-auto">
      {/* Success checkmark animation */}
      <motion.div
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
      >
        <motion.svg
          className="w-10 h-10 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </motion.svg>
      </motion.div>

      <motion.h2
        className="text-2xl md:text-3xl font-bold text-primary mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Day {dayNumber} Homework Submitted!
      </motion.h2>

      <motion.p
        className="text-primary/70 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Great work! Don't forget to tag <span className="text-accent font-semibold">@Tiana</span> in the challenge chat for your review.
      </motion.p>

      <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {onBackToChallenge && (
          <button
            onClick={onBackToChallenge}
            className="px-6 py-3 rounded-xl font-semibold text-primary/70 border-2 border-primary/20 hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            Back to Challenge
          </button>
        )}
        <a
          href="https://whop.com/joined/whop/5-day-challenge-chat-KwjSkTomNJzhtF/app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl font-semibold bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/30 transition-all duration-300"
        >
          Open Challenge Chat
        </a>
      </motion.div>
    </HomeworkCard>
  )
}
