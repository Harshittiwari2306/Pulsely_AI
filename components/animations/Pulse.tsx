'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PulseProps {
  children: ReactNode
}

export function Pulse({ children }: PulseProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
