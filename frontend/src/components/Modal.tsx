'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode, useEffect } from 'react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-large overflow-hidden`}
            >
              {/* Header */}
              {title && (
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-end gap-3">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}: ConfirmModalProps) {
  const variantConfig = {
    danger: { icon: '⚠️', buttonVariant: 'danger' as const },
    warning: { icon: '⚡', buttonVariant: 'primary' as const },
    info: { icon: 'ℹ️', buttonVariant: 'primary' as const },
  }

  const config = variantConfig[variant]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={config.buttonVariant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="text-5xl mb-4">{config.icon}</div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
        <p className="text-neutral-600">{message}</p>
      </div>
    </Modal>
  )
}
