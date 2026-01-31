'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8000'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PoseTrackerProps {
  exerciseType: string
  onExerciseTypeChange: (type: string) => void
  workoutId: string
}

export function PoseTracker({ exerciseType, onExerciseTypeChange, workoutId }: PoseTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [repCount, setRepCount] = useState(0)
  const [poseScore, setPoseScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Failed to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
    }
  }

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8)

    try {
      // Send to AI service for pose analysis
      const response = await fetch(`${AI_SERVICE_URL}/analyze-pose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData,
          exercise_type: exerciseType,
        }),
      })

      const data = await response.json()

      if (data.rep_count !== undefined) {
        setRepCount(data.rep_count)
      }
      if (data.pose_score !== undefined) {
        setPoseScore(data.pose_score)
      }
      if (data.feedback) {
        setFeedback(data.feedback)
      }
    } catch (error) {
      console.error('Error analyzing pose:', error)
    }
  }, [exerciseType])

  const startTracking = () => {
    setIsRecording(true)
    // Capture frame every 500ms
    frameIntervalRef.current = setInterval(captureFrame, 500)
  }

  const stopTracking = () => {
    setIsRecording(false)
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current)
      frameIntervalRef.current = null
    }
  }

  const saveSet = async () => {
    if (repCount === 0) return

    try {
      const token = localStorage.getItem('token')
      // First, we need to get or create a workout exercise
      // For simplicity, we'll create a placeholder exercise
      // In production, you'd select an exercise from a list

      // Save the set with rep count and pose score
      await fetch(`${API_URL}/api/workouts/sets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workoutExerciseId: workoutId, // This should be the workout exercise ID
          setNumber: 1,
          reps: repCount,
          poseScore: poseScore || undefined,
          repCount: repCount,
        }),
      })

      // Reset counter
      setRepCount(0)
      setPoseScore(null)
      setFeedback('')
    } catch (error) {
      console.error('Failed to save set:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Exercise Type:</label>
        <select
          value={exerciseType}
          onChange={(e) => onExerciseTypeChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="squat">Squat</option>
          <option value="pushup">Push-up</option>
          <option value="bicep_curl">Bicep Curl</option>
        </select>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopTracking : startTracking}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {isRecording ? (
            <>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ⏹️
              </motion.span>
              Stop Tracking
            </>
          ) : (
            <>
              <span>▶️</span>
              Start Tracking
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: repCount > 0 ? 1.05 : 1 }}
          whileTap={{ scale: repCount > 0 ? 0.95 : 1 }}
          onClick={saveSet}
          disabled={repCount === 0}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
        >
          <span>💾</span>
          Save Set ({repCount} reps)
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center gap-1">
            <span>🔢</span> Reps
          </p>
          <motion.p
            key={repCount}
            initial={{ scale: 1.3, color: '#3b82f6' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            {repCount}
          </motion.p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 text-center border border-green-200 dark:border-green-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center gap-1">
            <span>⭐</span> Pose Score
          </p>
          <motion.p
            key={poseScore}
            initial={{ scale: 1.3, color: '#10b981' }}
            animate={{ scale: 1, color: 'inherit' }}
            className="text-4xl font-bold text-gray-900 dark:text-white"
          >
            {poseScore !== null ? Math.round(poseScore) : '--'}
          </motion.p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
            <span>💬</span> Feedback
          </p>
          <motion.p
            key={feedback}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gray-900 dark:text-white"
          >
            {feedback || 'No feedback yet'}
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
