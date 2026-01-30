'use client'

import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import { motion } from 'framer-motion'

interface DiplomaProps {
  username: string
}

export function Diploma({ username }: DiplomaProps) {
  const diplomaRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!diplomaRef.current) return

    setIsDownloading(true)
    try {
      const dataUrl = await toPng(diplomaRef.current, {
        quality: 1,
        pixelRatio: 2,
      })

      const link = document.createElement('a')
      link.download = `whop-university-diploma-${username}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to download diploma:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Diploma Card - 16:9 aspect ratio (1280x720 equivalent) */}
      <div
        ref={diplomaRef}
        className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0d0d0d] to-[#1a1a1a] rounded-2xl border-4 border-accent/50 shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)',
          width: '800px',
          height: '450px',
          padding: '24px 32px',
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent/70" />
        <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent/70" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent/70" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent/70" />

        {/* Cap icon - top left corner */}
        <img
          src="/diploma/cap.png"
          alt="Graduation Cap"
          className="absolute top-10 left-10 w-20 h-20 object-contain"
        />

        {/* Trophy icon - bottom right corner */}
        <img
          src="/diploma/trophy.png"
          alt="Trophy"
          className="absolute bottom-10 right-10 w-20 h-20 object-contain"
        />

        {/* Main Content - centered */}
        <div className="h-full flex flex-col justify-center items-center text-center">
          {/* Header - Whop Logo */}
          <div className="mb-4 -mt-4 flex justify-center">
            <img
              src="/diploma/whop-logo.png"
              alt="Whop"
              className="h-12 object-contain"
            />
          </div>

          {/* Main Title */}
          <h1 className="text-2xl font-black text-white mb-1">
            Certificate of Completion
          </h1>
          <p className="text-accent text-sm font-semibold mb-6">Whop University 5 Day Challenge</p>

          {/* Certificate text */}
          <p className="text-white text-sm mb-2">This certifies that</p>
          <div className="relative inline-block mb-2">
            <h3 className="text-3xl md:text-4xl font-black text-accent px-4">
              {username}
            </h3>
            <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
          <p className="text-white text-sm mb-6">
            has successfully completed the <span className="text-accent font-semibold">5 Day Challenge</span>
          </p>

          {/* Signatures */}
          <div className="flex justify-center items-end gap-12 mb-2">
            {/* Tiana's signature */}
            <div className="text-center">
              <p
                className="text-xl text-white mb-0.5"
                style={{ fontFamily: 'cursive', fontStyle: 'italic' }}
              >
                Tiana Porta
              </p>
              <div className="w-24 h-0.5 bg-accent mx-auto mb-0.5" />
              <p className="text-[10px] text-white">Tiana Porta</p>
            </div>

            {/* Josh's signature */}
            <div className="text-center">
              <p
                className="text-xl text-white mb-0.5"
                style={{ fontFamily: 'cursive', fontStyle: 'italic' }}
              >
                Josh Gavin
              </p>
              <div className="w-24 h-0.5 bg-accent mx-auto mb-0.5" />
              <p className="text-[10px] text-white">Josh Gavin</p>
            </div>
          </div>

          {/* Date */}
          <p className="text-accent text-xs text-center font-semibold">
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Download Button */}
      <motion.button
        onClick={handleDownload}
        disabled={isDownloading}
        className="px-8 py-4 rounded-xl font-bold text-lg bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        whileHover={{ scale: isDownloading ? 1 : 1.02 }}
        whileTap={{ scale: isDownloading ? 1 : 0.98 }}
      >
        {isDownloading ? (
          <>
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
            Generating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Diploma
          </>
        )}
      </motion.button>
    </div>
  )
}
