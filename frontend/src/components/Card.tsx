'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function Card({ children, className, hover = false }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 32px rgba(11, 108, 241, 0.16)' } : {}}
      className={cn(
        'bg-white rounded-xl p-6 shadow-soft',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
