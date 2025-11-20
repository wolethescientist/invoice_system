'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, type, message, duration }
    
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastItemProps {
  toast: Toast
  onClose: () => void
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const config = {
    success: {
      icon: '✓',
      bgClass: 'bg-success-500',
      textClass: 'text-success-700',
      borderClass: 'border-success-200',
    },
    error: {
      icon: '✕',
      bgClass: 'bg-error-500',
      textClass: 'text-error-700',
      borderClass: 'border-error-200',
    },
    warning: {
      icon: '⚠',
      bgClass: 'bg-warning-500',
      textClass: 'text-warning-700',
      borderClass: 'border-warning-200',
    },
    info: {
      icon: 'ℹ',
      bgClass: 'bg-brand-500',
      textClass: 'text-brand-700',
      borderClass: 'border-brand-200',
    },
  }

  const { icon, bgClass, textClass, borderClass } = config[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className={`flex items-center gap-3 min-w-[300px] max-w-md bg-white rounded-xl shadow-large border ${borderClass} p-4`}
    >
      <div className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {icon}
      </div>
      <p className={`flex-1 text-sm font-medium ${textClass}`}>{toast.message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  )
}
