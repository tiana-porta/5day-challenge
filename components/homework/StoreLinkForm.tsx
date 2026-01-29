'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HomeworkCard } from './HomeworkCard'
import { SubmissionSuccess } from './SubmissionSuccess'

interface StoreLinkFormProps {
  dayNumber: number
}

export function StoreLinkForm({ dayNumber }: StoreLinkFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    storeLink: '',
    notes: '',
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username || formData.username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.storeLink || formData.storeLink.length < 5) {
      newErrors.storeLink = 'Please paste your store link'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/homework/submit-day4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          day: dayNumber,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubmitted(true)
      } else {
        setErrors(data.errors || { submit: data.message })
      }
    } catch {
      setErrors({ submit: 'Failed to submit. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <SubmissionSuccess
        dayNumber={dayNumber}
      />
    )
  }

  return (
    <HomeworkCard>
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold mb-4">
          Day {dayNumber}
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Build Your Store</h2>
        <p className="text-primary/60">Submit your store page link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-primary/70 mb-2">
            Whop Username
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-dark-lighter border-2 border-primary/10 text-primary placeholder-primary/30 focus:border-accent focus:outline-none transition-colors"
            placeholder="Your Whop username"
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-400">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-primary/70 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-dark-lighter border-2 border-primary/10 text-primary placeholder-primary/30 focus:border-accent focus:outline-none transition-colors"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        {/* Store Link */}
        <div>
          <label className="block text-sm font-medium text-primary/70 mb-2">
            Store Link
          </label>
          <input
            type="text"
            value={formData.storeLink}
            onChange={(e) => setFormData({ ...formData, storeLink: e.target.value })}
            className="w-full px-4 py-3 rounded-xl bg-dark-lighter border-2 border-primary/10 text-primary placeholder-primary/30 focus:border-accent focus:outline-none transition-colors"
            placeholder="Paste your store link here"
          />
          {errors.storeLink && (
            <p className="mt-1 text-sm text-red-400">{errors.storeLink}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-primary/70 mb-2">
            Additional Notes <span className="text-primary/40">(optional)</span>
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-dark-lighter border-2 border-primary/10 text-primary placeholder-primary/30 focus:border-accent focus:outline-none transition-colors resize-none"
            placeholder="Any questions or comments?"
          />
        </div>

        {errors.submit && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl font-bold text-lg bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Submitting...
            </span>
          ) : (
            'Submit Homework'
          )}
        </motion.button>
      </form>
    </HomeworkCard>
  )
}
