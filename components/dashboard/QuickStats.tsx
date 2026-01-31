'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface QuickStatsProps {
  stats: {
    totalWorkouts?: number
    totalVolume?: number
    workoutFrequency?: Array<{ date: string; count: number }>
  } | null
}

export function QuickStats({ stats }: QuickStatsProps) {
  const [animatedWorkouts, setAnimatedWorkouts] = useState(0)
  const [animatedVolume, setAnimatedVolume] = useState(0)

  useEffect(() => {
    const workouts = stats?.totalWorkouts ?? 0
    const volume = stats?.totalVolume ? Math.round(stats.totalVolume) : 0

    // Animate workouts
    const duration = 1000
    const steps = 30
    const increment = workouts / steps
    let current = 0
    const timer1 = setInterval(() => {
      current += increment
      if (current >= workouts) {
        setAnimatedWorkouts(workouts)
        clearInterval(timer1)
      } else {
        setAnimatedWorkouts(Math.floor(current))
      }
    }, duration / steps)

    // Animate volume
    current = 0
    const volumeIncrement = volume / steps
    const timer2 = setInterval(() => {
      current += volumeIncrement
      if (current >= volume) {
        setAnimatedVolume(volume)
        clearInterval(timer2)
      } else {
        setAnimatedVolume(Math.floor(current))
      }
    }, duration / steps)

    return () => {
      clearInterval(timer1)
      clearInterval(timer2)
    }
  }, [stats])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <span>📊</span> Quick Stats
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
            <span className="text-xl">🏋️</span>
          </div>
          <motion.p
            key={animatedWorkouts}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {animatedWorkouts}
          </motion.p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-5 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
            <span className="text-xl">💪</span>
          </div>
          <motion.p
            key={animatedVolume}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-gray-900 dark:text-white"
          >
            {animatedVolume} kg
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  )
}
