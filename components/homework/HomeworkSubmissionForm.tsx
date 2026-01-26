'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HomeworkCard } from './HomeworkCard'
import { SubmissionSuccess } from './SubmissionSuccess'
import { Day1FormData, FormErrors, SubmissionResponse } from '@/types/homework'

interface HomeworkSubmissionFormProps {
  dayNumber: number
  dayTitle: string
  worksheetDescription: string
  worksheetTemplateUrl?: string
  onSubmitSuccess?: () => void
}

export function HomeworkSubmissionForm({
  dayNumber,
  dayTitle,
  worksheetDescription,
  worksheetTemplateUrl,
  onSubmitSuccess,
}: HomeworkSubmissionFormProps) {
  const [formData, setFormData] = useState<Day1FormData>({
    username: '',
    email: '',
    worksheetLink: '',
    notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState<SubmissionResponse | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Validation functions
  const validateUsername = (username: string): string | undefined => {
    if (!username) return 'Username is required'
    if (username.length < 2) return 'Username must be at least 2 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return undefined
  }

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Please enter a valid email address'
    return undefined
  }

  const validateWorksheetLink = (url: string): string | undefined => {
    if (!url) return 'Worksheet link is required'
    try {
      new URL(url)
      return undefined
    } catch {
      return 'Please enter a valid URL'
    }
  }

  const validateNotes = (notes: string): string | undefined => {
    if (notes && notes.length > 500) {
      return 'Notes must be 500 characters or less'
    }
    return undefined
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      worksheetLink: validateWorksheetLink(formData.worksheetLink),
      notes: validateNotes(formData.notes || ''),
    }

    // Remove undefined errors
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors]
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isFormValid = (): boolean => {
    return (
      !validateUsername(formData.username) &&
      !validateEmail(formData.email) &&
      !validateWorksheetLink(formData.worksheetLink) &&
      !validateNotes(formData.notes || '')
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitResult(null)

    try {
      const response = await fetch('/api/homework/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          day: dayNumber,
        }),
      })

      const result: SubmissionResponse = await response.json()

      if (result.success) {
        setShowSuccess(true)
        onSubmitSuccess?.()
      } else {
        setSubmitResult(result)
      }
    } catch (error) {
      console.error('❌ Form submission error:', error)
      setSubmitResult({
        success: false,
        message: 'Network error. Please check your connection and try again.',
      })
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
    <HomeworkCard>
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-semibold">
          Day {dayNumber} of 5
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
        Day {dayNumber} Homework: {dayTitle}
      </h1>
      <p className="text-primary/70 mb-6">{worksheetDescription}</p>

      {/* Worksheet template link */}
      {worksheetTemplateUrl && (
        <motion.a
          href={worksheetTemplateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-3 mb-8 rounded-xl bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Get the Day {dayNumber} Worksheet Template
        </motion.a>
      )}

      {/* Error message */}
      {submitResult && !submitResult.success && (
        <motion.div
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {submitResult.message}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username field */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-primary mb-2"
          >
            Whop Username <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="your_username"
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.username
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all duration-300`}
            aria-describedby={errors.username ? 'username-error' : undefined}
            aria-invalid={!!errors.username}
          />
          {errors.username && (
            <p id="username-error" className="mt-2 text-sm text-red-400">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-primary mb-2"
          >
            Email Address <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="you@example.com"
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.email
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all duration-300`}
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-400">
              {errors.email}
            </p>
          )}
        </div>

        {/* Worksheet link field */}
        <div>
          <label
            htmlFor="worksheetLink"
            className="block text-sm font-medium text-primary mb-2"
          >
            "Never Been Easier" Worksheet Link <span className="text-accent">*</span>
          </label>
          <input
            type="url"
            id="worksheetLink"
            name="worksheetLink"
            value={formData.worksheetLink}
            onChange={handleInputChange}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.worksheetLink
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all duration-300`}
            aria-describedby={errors.worksheetLink ? 'worksheetLink-error' : undefined}
            aria-invalid={!!errors.worksheetLink}
          />
          {errors.worksheetLink && (
            <p id="worksheetLink-error" className="mt-2 text-sm text-red-400">
              {errors.worksheetLink}
            </p>
          )}
          <p className="mt-2 text-xs text-primary/50">
            Make sure your Google Sheet is set to "Anyone with the link can view"
          </p>
        </div>

        {/* Notes field */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-primary mb-2"
          >
            Additional Notes{' '}
            <span className="text-primary/50 font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any questions or comments about your submission..."
            rows={4}
            className={`w-full px-4 py-3 rounded-xl bg-dark/50 border-2 ${
              errors.notes
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-primary/20 focus:border-accent/50'
            } text-primary placeholder-primary/40 outline-none transition-all duration-300 resize-none`}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
            aria-invalid={!!errors.notes}
          />
          {errors.notes && (
            <p id="notes-error" className="mt-2 text-sm text-red-400">
              {errors.notes}
            </p>
          )}
          <p className="mt-2 text-xs text-primary/50 text-right">
            {(formData.notes?.length || 0)}/500 characters
          </p>
        </div>

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
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
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
            'Submit Day 1 Homework'
          )}
        </motion.button>
      </form>
    </HomeworkCard>
  )
}
