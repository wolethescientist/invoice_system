'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl border transition-all duration-200',
              'bg-white text-neutral-900 placeholder-neutral-500',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
              'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500',
              error ? 'border-error-500 focus:ring-error-500' : 'border-neutral-300',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-600">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  rows?: number
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border transition-all duration-200',
            'bg-white text-neutral-900 placeholder-neutral-500',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-500',
            'resize-none scrollbar-thin',
            error ? 'border-error-500 focus:ring-error-500' : 'border-neutral-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-error-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-neutral-600">{helperText}</p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
