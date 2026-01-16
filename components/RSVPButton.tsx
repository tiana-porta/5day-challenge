'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WhopCheckout } from './WhopCheckout'

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
  const [showModal, setShowModal] = useState(false)
  const [checkoutComplete, setCheckoutComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutKey, setCheckoutKey] = useState(0)

  useEffect(() => {
    // Fetch initial count from API
    const fetchCount = async () => {
      const initialCount = await getRSVPCount()
      setCount(initialCount)
      setLoading(false)
    }
    fetchCount()

    // Poll for updates every 5 seconds to get real-time count from other users
    const interval = setInterval(async () => {
      const updatedCount = await getRSVPCount()
      setCount(updatedCount)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRSVP = () => {
    // Just open the modal - don't increment count yet
    // Count will increment when checkout is completed
    // Force remount of checkout by changing key BEFORE opening modal
    setCheckoutKey(prev => prev + 1)
    // Small delay to ensure key change takes effect
    setTimeout(() => {
      setShowModal(true)
    }, 50)
  }
  
  const handleCheckoutComplete = async () => {
    // When checkout is completed, increment the count and show success
    const newCount = await incrementRSVP()
    setCount(newCount)
    setCheckoutComplete(true)
    setJustRSVPed(true)
  }

  const closeModal = () => {
    // Only allow closing if checkout is complete
    if (checkoutComplete) {
      setShowModal(false)
      setCheckoutComplete(false)
      setCheckoutKey(prev => prev + 1) // Reset for next time
    }
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <>
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

      {/* Modal with Whop Checkout */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop - only clickable if checkout complete */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={checkoutComplete ? closeModal : undefined}
              style={{ pointerEvents: checkoutComplete ? 'auto' : 'none' }}
            />
            
            {/* Modal Content */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div
                className="backdrop-blur-xl bg-dark/95 border-2 border-primary/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button - only show if checkout is complete */}
                {checkoutComplete && (
                  <button
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-primary/70 hover:text-primary transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                {!checkoutComplete ? (
                  <>
                    {/* Modal Header */}
                    <div className="text-center mb-6">
                      <h2 className="text-3xl font-bold text-primary mb-2">
                        Join the Waitlist
                      </h2>
                      <p className="text-primary/70">
                        Secure your spot for the 5 Day Challenge
                      </p>
                    </div>

                    {/* Whop Checkout Embed */}
                    <div className="mt-6 min-h-[400px]">
                      {showModal && (
                        <WhopCheckout 
                          key={`checkout-${checkoutKey}-${Date.now()}`}
                          planId="plan_6qlhHFelOu6cx"
                          theme="system"
                          accentColor="orange"
                          onComplete={handleCheckoutComplete}
                          isVisible={true}
                          checkoutKey={checkoutKey}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  /* Success Page */
                  <div className="text-center py-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="mb-6"
                    >
                      <div className="w-24 h-24 mx-auto bg-accent/20 rounded-full flex items-center justify-center mb-6">
                        <svg
                          className="w-12 h-12 text-accent"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </motion.div>
                    <motion.h2
                      className="text-4xl font-bold text-primary mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      You're In! 🎉
                    </motion.h2>
                    <motion.p
                      className="text-xl text-primary/70 mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Welcome to the 5 Day Challenge. Get ready to build something amazing!
                    </motion.p>
                    <motion.button
                      onClick={closeModal}
                      className="px-8 py-4 rounded-xl font-bold text-lg bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/50 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

