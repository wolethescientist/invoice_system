'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  hover?: boolean
  gradient?: boolean
  glass?: boolean
}

export function Card({ children, hover = false, gradient = false, glass = false, className, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, boxShadow: '0 4px 16px rgba(11, 108, 241, 0.12)' } : undefined}
      className={cn(
        'rounded-xl p-6 transition-all duration-300',
        glass ? 'glass' : 'bg-white shadow-soft border border-neutral-200',
        gradient && 'bg-gradient-to-br from-white to-brand-50',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  color?: 'brand' | 'success' | 'warning' | 'error'
}

export function StatCard({ title, value, change, icon, trend = 'neutral', color = 'brand' }: StatCardProps) {
  const colorClasses = {
    brand: 'from-brand-500 to-brand-600',
    success: 'from-success-500 to-success-600',
    warning: 'from-warning-500 to-warning-600',
    error: 'from-error-500 to-error-600',
  }

  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'
  const trendColor = trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-error-600' : 'text-neutral-600'

  return (
    <Card hover className="relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colorClasses[color]}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
              <span>{trendIcon}</span>
              <span>{Math.abs(change)}%</span>
              <span className="text-neutral-500 font-normal">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-medium`}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
