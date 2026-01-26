'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HomeworkCard } from './HomeworkCard'
import { SubmissionSuccess } from './SubmissionSuccess'

interface WorksheetRow {
  cantBecause: string
  reframed: boolean
  neverEasierBecause: string
}

interface WorksheetFormProps {
  dayNumber: number
  onSubmitSuccess?: () => void
}

const INITIAL_ROWS = 10

export function WorksheetForm({ dayNumber, onSubmitSuccess }: WorksheetFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [rows, setRows] = useState<WorksheetRow[]>(
    Array(INITIAL_ROWS).fill(null).map(() => ({
      cantBecause: '',
      reframed: false,
      neverEasierBecause: '',
    }))
  )
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const updateRow = (index: number, field: keyof WorksheetRow, value: string | boolean) => {
    setRows(prev => {
      const newRows = [...prev]
      newRows[index] = { ...newRows[index], [field]: value }
      return newRows
    })
  }

  const addMoreRows = () => {
    setRows(prev => [
      ...prev,
      ...Array(5).fill(null).map(() => ({
        cantBecause: '',
        reframed: false,
        neverEasierBecause: '',
      }))
    ])
  }

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

    // Check if at least one row is filled out
    const filledRows = rows.filter(row => row.cantBecause.trim() || row.neverEasierBecause.trim())
    if (filledRows.length === 0) {
      newErrors.worksheet = 'Please fill out at least one limiting belief and reframe'
    }

    // Check that filled rows have both columns
    const incompleteRows = rows.filter(
      row => (row.cantBecause.trim() && !row.neverEasierBecause.trim()) ||
             (!row.cantBecause.trim() && row.neverEasierBecause.trim())
    )
    if (incompleteRows.length > 0) {
      newErrors.worksheet = 'Please complete both columns for each row you fill out'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    // Filter to only filled rows
    const filledRows = rows.filter(row => row.cantBecause.trim() && row.neverEasierBecause.trim())

    try {
      const response = await fetch('/api/homework/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          day: dayNumber,
          worksheetData: filledRows,
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

  const filledRowCount = rows.filter(row => row.cantBecause.trim() && row.neverEasierBecause.trim()).length

  return (
    <HomeworkCard className="max-w-5xl">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
          Day {dayNumber} of 5
        </div>
        <div className="text-sm text-primary/50">
          {filledRowCount} reframe{filledRowCount !== 1 ? 's' : ''} completed
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
        Day 1: Never Been Easier
      </h1>
      <p className="text-primary/70 mb-8">
        Fill out your limiting beliefs and reframe them. Complete at least one row to submit.
      </p>

      <form onSubmit={handleSubmit}>
        {/* User info fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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

        {/* Worksheet table */}
        <div className="mb-6 overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-2 mb-3">
              <div className="text-center py-3 px-4 rounded-xl bg-accent/20 text-accent font-bold text-sm md:text-base">
                I Can't Make $10,000 Because...
              </div>
              <div className="text-center py-3 px-2 rounded-xl bg-primary/10 text-primary/70 font-semibold text-sm">
                Reframe
              </div>
              <div className="text-center py-3 px-4 rounded-xl bg-accent/20 text-accent font-bold text-sm md:text-base">
                It's Never Been Easier to Make $10,000 Because...
              </div>
            </div>

            {/* Example rows */}
            <div className="grid grid-cols-[1fr_80px_1fr] gap-2 mb-2 opacity-60">
              <div className="py-2 px-4 rounded-lg bg-dark/30 text-primary/60 text-sm italic">
                Example: I don't know what to sell
              </div>
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-accent/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
              <div className="py-2 px-4 rounded-lg bg-dark/30 text-primary/60 text-sm italic">
                Example: I have access to coaches inside WhopU who I can ask
              </div>
            </div>

            {/* Input rows */}
            <AnimatePresence>
              {rows.map((row, index) => (
                <motion.div
                  key={index}
                  className="grid grid-cols-[1fr_80px_1fr] gap-2 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <input
                    type="text"
                    value={row.cantBecause}
                    onChange={(e) => updateRow(index, 'cantBecause', e.target.value)}
                    placeholder={`Limiting belief ${index + 1}...`}
                    className="w-full py-3 px-4 rounded-xl bg-dark/50 border-2 border-primary/10 focus:border-accent/30 text-primary placeholder-primary/30 outline-none transition-all text-sm"
                  />
                  <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => updateRow(index, 'reframed', !row.reframed)}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        row.reframed
                          ? 'bg-accent border-accent'
                          : 'border-primary/30 hover:border-accent/50'
                      }`}
                    >
                      {row.reframed && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={row.neverEasierBecause}
                    onChange={(e) => updateRow(index, 'neverEasierBecause', e.target.value)}
                    placeholder={`Reframe ${index + 1}...`}
                    className="w-full py-3 px-4 rounded-xl bg-dark/50 border-2 border-primary/10 focus:border-accent/30 text-primary placeholder-primary/30 outline-none transition-all text-sm"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {errors.worksheet && (
          <p className="mb-4 text-sm text-red-400">{errors.worksheet}</p>
        )}

        {/* Add more rows button */}
        <button
          type="button"
          onClick={addMoreRows}
          className="mb-8 px-4 py-2 rounded-xl border-2 border-dashed border-primary/20 text-primary/50 hover:border-accent/30 hover:text-accent transition-all duration-300 text-sm"
        >
          + Add 5 more rows
        </button>

        {/* Notes field */}
        <div className="mb-8">
          <label htmlFor="notes" className="block text-sm font-medium text-primary mb-2">
            Additional Notes <span className="text-primary/50 font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any questions or thoughts about this exercise..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-dark/50 border-2 border-primary/20 focus:border-accent/50 text-primary placeholder-primary/40 outline-none transition-all resize-none"
          />
          <p className="mt-1 text-xs text-primary/50 text-right">{notes.length}/500</p>
        </div>

        {/* Error message */}
        {submitError && (
          <motion.div
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {submitError}
          </motion.div>
        )}

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
            !isSubmitting
              ? 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/30'
              : 'bg-primary/10 text-primary/40 cursor-not-allowed'
          }`}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
            `Submit Day ${dayNumber} Homework`
          )}
        </motion.button>
      </form>
    </HomeworkCard>
  )
}
