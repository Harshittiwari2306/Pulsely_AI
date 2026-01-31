'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { motion } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkouts()
  }, [])

  const fetchWorkouts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workouts?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setWorkouts(data.workouts || [])
    } catch (error) {
      console.error('Failed to fetch workouts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading workouts...</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📅</span> Recent Workouts
        </h3>
        <Link href="/workout" className="text-primary hover:underline text-sm font-medium">
          View All →
        </Link>
      </div>

      {workouts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🏋️
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">
            No workouts yet. Start your first workout!
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, x: 5 }}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-700/50"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl"
                  >
                    💪
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{workout.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {format(new Date(workout.startedAt), 'MMM d, yyyy h:mm a')}
                    </p>
                    {workout.duration && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        ⏱️ {workout.duration} minutes
                      </p>
                    )}
                  </div>
                </div>
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium"
                >
                  {workout.type}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
