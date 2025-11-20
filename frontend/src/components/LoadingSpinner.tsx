'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'brand' | 'white' | 'neutral'
}

export function LoadingSpinner({ size = 'md', color = 'brand' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const colorClasses = {
    brand: 'border-brand-500',
    white: 'border-white',
    neutral: 'border-neutral-500',
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
    />
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-brand-50">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4"
        >
          H
        </motion.div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-neutral-600 font-medium"
        >
          Loading...
        </motion.div>
      </div>
    </div>
  )
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}
