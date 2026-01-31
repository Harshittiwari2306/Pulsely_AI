'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ReadinessScore } from '@/components/dashboard/ReadinessScore'
import { RecentWorkouts } from '@/components/dashboard/RecentWorkouts'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FadeIn } from '@/components/animations/FadeIn'
import { motion } from 'framer-motion'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [readinessScore, setReadinessScore] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchReadinessScore()
      fetchStats()
    }
  }, [user])

  const fetchReadinessScore = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/recovery/readiness?days=1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.scores && data.scores.length > 0) {
        setReadinessScore(data.scores[0])
      }
    } catch (error) {
      console.error('Failed to fetch readiness score:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/analytics/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
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
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pulsely AI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/workout"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Workout
              </Link>
              <Link
                href="/analytics"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Analytics
              </Link>
              <Link
                href="/recovery"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Recovery
              </Link>
              <Link
                href="/coach"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                AI Coach
              </Link>
              <ThemeToggle />
              <button
                onClick={() => {
                  localStorage.removeItem('token')
                  localStorage.removeItem('user')
                  router.push('/login')
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Welcome back, {user?.name || user?.email?.split('@')[0]}! 👋
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Ready to crush your fitness goals today?</p>
            </motion.div>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Readiness Score */}
          <FadeIn delay={0.1}>
            <div className="lg:col-span-1">
              <ReadinessScore score={readinessScore} />
            </div>
          </FadeIn>

          {/* Quick Stats */}
          <FadeIn delay={0.2}>
            <div className="lg:col-span-2">
              <QuickStats stats={stats} />
            </div>
          </FadeIn>
        </div>

        {/* Recent Workouts */}
        <FadeIn delay={0.3}>
          <div className="mt-8">
            <RecentWorkouts />
          </div>
        </FadeIn>
      </main>
    </div>
  )
}
