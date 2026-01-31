'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export default function CoachPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  /* Redirect if not authenticated */
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  /* Fetch chat history */
  useEffect(() => {
    if (user) fetchHistory()
  }, [user])

  /* Auto-scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchHistory = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`${API_URL}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) return

      const data = await res.json()
      setMessages(data.messages ?? [])
    } catch (err) {
      console.error('Failed to fetch chat history', err)
    }
  }

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const token = localStorage.getItem('token')
    if (!token) return

    const content = input.trim()

    setMessages((prev) => [
      ...prev,
      { role: 'user', content, createdAt: new Date().toISOString() },
    ])

    setInput('')
    setSending(true)

    try {
      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      })

      const data = await res.json()

      if (!res.ok || !data.message) {
        throw new Error(data.error || 'AI response failed')
      }

      setMessages((prev) => [...prev, data.message])
    } catch (err: any) {
      console.error(err)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ The AI service is currently unavailable. Please try again later.',
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <nav className="border-b bg-white dark:bg-gray-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-700 dark:text-gray-300"
          >
            ← Dashboard
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold">AI Fitness Coach</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask about workouts, recovery, nutrition, and training plans
          </p>
        </motion.div>

        <div className="flex flex-1 flex-col overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${m.role === 'user'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700'
                    }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="text-sm text-gray-500">AI is typing…</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="border-t p-4 dark:border-gray-700 bg-white dark:bg-gray-800  "
          >
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI coach…"
                className="flex-1 rounded-lg border px-4 py-2 bg-white dark:bg-gray-800"
                disabled={sending}
              />
              <button
                disabled={!input.trim() || sending}
                className="rounded-lg bg-primary px-5 py-2 text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
