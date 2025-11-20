'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  className?: string
}

export function Badge({ children, variant = 'info', size = 'md', dot = false, className }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  const variantClasses = {
    success: 'bg-success-100 text-success-700 border-success-200',
    warning: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-error-100 text-error-700 border-error-200',
    info: 'bg-brand-100 text-brand-700 border-brand-200',
    neutral: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  }

  const dotColors = {
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    error: 'bg-error-500',
    info: 'bg-brand-500',
    neutral: 'bg-neutral-500',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}
