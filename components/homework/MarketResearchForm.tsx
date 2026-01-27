'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HomeworkCard } from './HomeworkCard'
import { SubmissionSuccess } from './SubmissionSuccess'

interface MarketResearchFormProps {
  dayNumber: number
  onSubmitSuccess?: () => void
}

export function MarketResearchForm({ dayNumber, onSubmitSuccess }: MarketResearchFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [market, setMarket] = useState('')
  const [whyProfitable, setWhyProfitable] = useState('')
  const [problem, setProblem] = useState('')
  const [desiredOutcome, setDesiredOutcome] = useState('')
  const [researchLink, setResearchLink] = useState('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!username || username.length < 2) {
      newErrors.username = 'Username is required (min 2 characters)'
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores'
    }

    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!market || market.length < 3) {
      newErrors.market = 'Please describe your market'
    }

    if (!whyProfitable || whyProfitable.length < 10) {
      newErrors.whyProfitable = 'Please explain why this market is profitable'
    }

    if (!problem || problem.length < 10) {
      newErrors.problem = 'Please describe the problem your audience has'
    }

    if (!desiredOutcome || desiredOutcome.length < 10) {
      newErrors.desiredOutcome = 'Please describe what outcome they want'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = (): boolean => {
    return (
      username.length >= 2 &&
      /^[a-zA-Z0-9_]+$/.test(username) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      market.length >= 3 &&
      whyProfitable.length >= 10 &&
      problem.length >= 10 &&
      desiredOutcome.length >= 10
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/homework/submit-day2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          day: dayNumber,
          market,
          whyProfitable,
          problem,
          desiredOutcome,
          researchLink: researchLink || '',
          notes: notes || '',
        }),
      })

      const result = await response.json()

      if (result.success) {
        setShowSuccess(true)
        onSubmitSuccess?.()
      } else {
        setSubmitError(result.message || 'Failed to submit. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToChallenge = () => {
    window.location.href = '/'
  }

  if (showSuccess) {
    return (
      <SubmissionSuccess
        dayNumber={dayNumber}
        onBackToChallenge={handleBackToChallenge}
      />
    )
  }

  return (
    <HomeworkCard className="max-w-3xl">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
          Day {dayNumber} of 5
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
        Day 2: Market Research
      </h1>
      <p className="text-primary/70 mb-8">
        Pick a profitable market and understand what your audience actually wants to buy.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User info fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
              Whop Username <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (errors.username) setErrors(prev => ({ ...prev, username: '' }))
              }}
              placeholder="your_username"
              className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
                errors.username ? 'border-red-500/50' : 'border-primary/20 focus:border-accent/50'
              } text-primary placeholder-primary/40 outline-none transition-all`}
            />
            {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
              Email Address <span className="text-accent">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
              }}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
                errors.email ? 'border-red-500/50' : 'border-primary/20 focus:border-accent/50'
              } text-primary placeholder-primary/40 outline-none transition-all`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>
        </div>

        {/* Market field */}
        <div>
          <label htmlFor="market" className="block text-sm font-medium text-primary mb-2">
            What market are you entering? <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="market"
            value={market}
            onChange={(e) => {
              setMarket(e.target.value)
              if (errors.market) setErrors(prev => ({ ...prev, market: '' }))
            }}
            placeholder="e.g., Fitness for busy professionals, E-commerce for pet owners..."
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.market ? 'border-red-500/50' : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all`}
          />
          {errors.market && <p className="mt-1 text-sm text-red-400">{errors.market}</p>}
        </div>

        {/* Why Profitable field */}
        <div>
          <label htmlFor="whyProfitable" className="block text-sm font-medium text-primary mb-2">
            Why is this market already profitable? <span className="text-accent">*</span>
          </label>
          <p className="text-xs text-primary/50 mb-2">What evidence shows people are already spending money here?</p>
          <textarea
            id="whyProfitable"
            value={whyProfitable}
            onChange={(e) => {
              setWhyProfitable(e.target.value)
              if (errors.whyProfitable) setErrors(prev => ({ ...prev, whyProfitable: '' }))
            }}
            placeholder="e.g., There are multiple successful competitors, I found courses selling for $500+, Reddit communities with 100k+ members asking for solutions..."
            rows={3}
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.whyProfitable ? 'border-red-500/50' : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all resize-none`}
          />
          {errors.whyProfitable && <p className="mt-1 text-sm text-red-400">{errors.whyProfitable}</p>}
        </div>

        {/* Problem field */}
        <div>
          <label htmlFor="problem" className="block text-sm font-medium text-primary mb-2">
            What problem does your target audience have? <span className="text-accent">*</span>
          </label>
          <p className="text-xs text-primary/50 mb-2">The PROBLEM is the foundation of every business.</p>
          <textarea
            id="problem"
            value={problem}
            onChange={(e) => {
              setProblem(e.target.value)
              if (errors.problem) setErrors(prev => ({ ...prev, problem: '' }))
            }}
            placeholder="e.g., They want to lose weight but don't have time for long gym sessions, they struggle to find healthy meals that fit their schedule..."
            rows={3}
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.problem ? 'border-red-500/50' : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all resize-none`}
          />
          {errors.problem && <p className="mt-1 text-sm text-red-400">{errors.problem}</p>}
        </div>

        {/* Desired Outcome field */}
        <div>
          <label htmlFor="desiredOutcome" className="block text-sm font-medium text-primary mb-2">
            What outcome/solution are they looking for? <span className="text-accent">*</span>
          </label>
          <p className="text-xs text-primary/50 mb-2">People buy OUTCOMES, not products. What do they actually want?</p>
          <textarea
            id="desiredOutcome"
            value={desiredOutcome}
            onChange={(e) => {
              setDesiredOutcome(e.target.value)
              if (errors.desiredOutcome) setErrors(prev => ({ ...prev, desiredOutcome: '' }))
            }}
            placeholder="e.g., They want to look good, feel confident, have energy to play with their kids, fit into their old clothes..."
            rows={3}
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.desiredOutcome ? 'border-red-500/50' : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all resize-none`}
          />
          {errors.desiredOutcome && <p className="mt-1 text-sm text-red-400">{errors.desiredOutcome}</p>}
        </div>

        {/* Research Link field (optional) */}
        <div>
          <label htmlFor="researchLink" className="block text-sm font-medium text-primary mb-2">
            Link to your research doc <span className="text-primary/50 font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            id="researchLink"
            value={researchLink}
            onChange={(e) => setResearchLink(e.target.value)}
            placeholder="https://docs.google.com/..."
            className="w-full px-4 py-3 rounded-xl bg-dark/50 border-2 border-primary/20 focus:border-accent/50 text-primary placeholder-primary/40 outline-none transition-all"
          />
        </div>

        {/* Notes field (optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-primary mb-2">
            Additional Notes <span className="text-primary/50 font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any questions or thoughts about your research..."
            rows={2}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-dark/50 border-2 border-primary/20 focus:border-accent/50 text-primary placeholder-primary/40 outline-none transition-all resize-none"
          />
          <p className="mt-1 text-xs text-primary/50 text-right">{notes.length}/500</p>
        </div>

        {/* Error message */}
        {submitError && (
          <motion.div
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {submitError}
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={!isFormValid() || isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            isFormValid() && !isSubmitting
              ? 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/30'
              : 'bg-primary/10 text-primary/40 cursor-not-allowed'
          }`}
          whileHover={isFormValid() && !isSubmitting ? { scale: 1.02 } : {}}
          whileTap={isFormValid() && !isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Day 2 Homework'
          )}
        </motion.button>
      </form>
    </HomeworkCard>
  )
}
