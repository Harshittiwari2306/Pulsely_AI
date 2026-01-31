'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { PoseTracker } from '@/components/workout/PoseTracker'
import { WorkoutForm } from '@/components/workout/WorkoutForm'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FadeIn } from '@/components/animations/FadeIn'
import { motion } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'

export default function WorkoutPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeWorkout, setActiveWorkout] = useState<any>(null)
  const [exerciseType, setExerciseType] = useState<string>('squat')
  const [showCamera, setShowCamera] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const startWorkout = async (name: string, type: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workouts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, type }),
      })

      const data = await response.json()
      if (data.workout) {
        setActiveWorkout(data.workout)
      }
    } catch (error) {
      console.error('Failed to start workout:', error)
    }
  }

  const completeWorkout = async () => {
    if (!activeWorkout) return

    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/workouts/${activeWorkout.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      setActiveWorkout(null)
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to complete workout:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to Dashboard
              </button>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!activeWorkout ? (
          <WorkoutForm onStart={startWorkout} />
        ) : (
          <FadeIn>
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                    {activeWorkout.name}
                  </h2>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                    className="text-3xl"
                  >
                    🔥
                  </motion.div>
                </div>
                
                <div className="flex space-x-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCamera(!showCamera)}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <span>{showCamera ? '📷' : '📹'}</span>
                    {showCamera ? 'Hide' : 'Show'} Camera
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={completeWorkout}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <span>✅</span>
                    Complete Workout
                  </motion.button>
                </div>

                {showCamera && (
                  <div className="mt-6">
                    <PoseTracker
                      exerciseType={exerciseType}
                      onExerciseTypeChange={setExerciseType}
                      workoutId={activeWorkout.id}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  )
}
