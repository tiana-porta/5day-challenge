'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const TARGET_DATE = new Date('2026-01-26T21:00:00Z') // 4PM EST = 9PM UTC

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = TARGET_DATE.getTime()
      const difference = target - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [])

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
        Challenge starts in:
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            className="backdrop-blur-xl bg-dark/70 border-2 border-primary/20 rounded-3xl p-6 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="text-center">
              <motion.div
                key={unit.value}
                className="text-5xl md:text-6xl font-black text-accent mb-2"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {String(unit.value).padStart(2, '0')}
              </motion.div>
              <div className="text-sm md:text-base text-primary/70 font-semibold uppercase tracking-wide">
                {unit.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="text-primary/60 text-sm mt-4">
        January 26, 2026 at 4:00 PM EST
      </div>
    </div>
  )
}

