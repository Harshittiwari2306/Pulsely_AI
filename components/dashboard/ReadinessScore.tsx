'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface ReadinessScoreProps {
  score: {
    score: number
    sleepScore?: number
    fatigueScore?: number
    strainScore?: number
    date: string
  } | null
}

export function ReadinessScore({ score }: ReadinessScoreProps) {
  const readinessScore = score?.score ?? 0
  const [animatedScore, setAnimatedScore] = useState(0)
  const color = readinessScore >= 80 ? 'green' : readinessScore >= 60 ? 'yellow' : 'red'

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = readinessScore / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= readinessScore) {
        setAnimatedScore(readinessScore)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [readinessScore])

  const getColorClass = () => {
    if (readinessScore >= 80) return 'text-green-500'
    if (readinessScore >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Readiness Score</h3>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <span className="text-2xl">⚡</span>
        </motion.div>
      </div>
      
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-40 h-40">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="10"
              fill="none"
              className={getColorClass()}
              strokeDasharray={`${2 * Math.PI * 70}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - readinessScore / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={animatedScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-gray-900 dark:text-white"
            >
              {animatedScore}
            </motion.span>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">out of 100</span>
          </div>
        </div>
      </div>

      {score && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Sleep</span>
            <span className="font-medium text-gray-900 dark:text-white">{score.sleepScore?.toFixed(0) ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Fatigue</span>
            <span className="font-medium text-gray-900 dark:text-white">{score.fatigueScore?.toFixed(0) ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Strain</span>
            <span className="font-medium text-gray-900 dark:text-white">{score.strainScore?.toFixed(0) ?? 'N/A'}</span>
          </div>
        </div>
      )}

      {!score && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          No readiness data yet. Log your recovery metrics to get started.
        </p>
      )}
    </motion.div>
  )
}
