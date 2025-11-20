'use client'

import { ReactNode } from 'react'
import { Button } from './Button'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-6 opacity-50"
        >
          {icon}
        </motion.div>
      )}
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-600 max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="primary">
          {action.label}
        </Button>
      )}
    </motion.div>
  )
}
