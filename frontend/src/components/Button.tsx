'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  isLoading?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className, 
  leftIcon,
  rightIcon,
  isLoading,
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-ring rounded-xl relative overflow-hidden'
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  const variantStyles = {
    primary: 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 shadow-soft hover:shadow-medium',
    secondary: 'bg-white text-brand-600 border-2 border-brand-500 hover:bg-brand-50 shadow-soft',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
    danger: 'bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 shadow-soft',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 shadow-soft',
    outline: 'bg-transparent text-neutral-700 border-2 border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50',
  }

  const isDisabled = disabled || isLoading

  return (
    <motion.button
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={isDisabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span>{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span>{rightIcon}</span>}
    </motion.button>
  )
}
