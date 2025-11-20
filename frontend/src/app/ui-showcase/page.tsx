'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/DashboardLayout'
import {
  Button,
  Card,
  StatCard,
  Badge,
  Input,
  TextArea,
  Modal,
  ConfirmModal,
  Tooltip,
  EmptyState,
  useToast,
} from '@/components'

export default function UIShowcase() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { showToast } = useToast()

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">UI Component Showcase</h1>
          <p className="text-neutral-600">
            Explore the enhanced design system with modern components and animations
          </p>
        </div>

        {/* Buttons */}
        <Card>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="primary" isLoading>Loading...</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button leftIcon="🚀">With Left Icon</Button>
            <Button rightIcon="→">With Right Icon</Button>
            <Button leftIcon="💾" rightIcon="✓">Both Icons</Button>
          </div>
        </Card>

        {/* Stat Cards */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Stat Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value="$45,231"
              change={12.5}
              trend="up"
              icon="💰"
              color="brand"
            />
            <StatCard
              title="Active Users"
              value="2,345"
              change={8.2}
              trend="up"
              icon="👥"
              color="success"
            />
            <StatCard
              title="Pending Tasks"
              value="23"
              change={-5.4}
              trend="down"
              icon="📋"
              color="warning"
            />
            <StatCard
              title="Conversion Rate"
              value="3.2%"
              change={0}
              trend="neutral"
              icon="📈"
              color="error"
            />
          </div>
        </div>

        {/* Badges */}
        <Card>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="success" dot>With Dot</Badge>
            <Badge variant="warning" dot>With Dot</Badge>
            <Badge variant="error" dot>With Dot</Badge>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
        </Card>

        {/* Form Inputs */}
        <Card>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Form Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              leftIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              helperText="Must be at least 8 characters"
            />
            <Input
              label="With Error"
              type="text"
              error="This field is required"
            />
            <TextArea
              label="Description"
              placeholder="Enter a description..."
              rows={4}
            />
          </div>
        </Card>

        {/* Tooltips */}
        <Card>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Tooltips</h2>
          <div className="flex flex-wrap gap-4">
            <Tooltip content="This is a top tooltip" position="top">
              <Button>Hover me (Top)</Button>
            </Tooltip>
            <Tooltip content="This is a bottom tooltip" position="bottom">
              <Button>Hover me (Bottom)</Button>
            </Tooltip>
            <Tooltip content="This is a left tooltip" position="left">
              <Button>Hover me (Left)</Button>
            </Tooltip>
            <Tooltip content="This is a right tooltip" position="right">
              <Button>Hover me (Right)</Button>
            </Tooltip>
          </div>
        </Card>

        {/* Modals & Toasts */}
        <Card>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Modals & Toasts</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
            <Button onClick={() => setConfirmOpen(true)} variant="danger">
              Open Confirm Dialog
            </Button>
            <Button onClick={() => showToast('success', 'Operation completed successfully!')}>
              Show Success Toast
            </Button>
            <Button onClick={() => showToast('error', 'Something went wrong!')}>
              Show Error Toast
            </Button>
            <Button onClick={() => showToast('warning', 'Please review your changes')}>
              Show Warning Toast
            </Button>
            <Button onClick={() => showToast('info', 'New update available')}>
              Show Info Toast
            </Button>
          </div>
        </Card>

        {/* Empty State */}
        <Card>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Empty State</h2>
          <EmptyState
            icon="📭"
            title="No items found"
            description="Get started by creating your first item"
            action={{
              label: 'Create Item',
              onClick: () => showToast('info', 'Create action clicked'),
            }}
          />
        </Card>

        {/* Cards with Effects */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card hover>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Hover Card</h3>
              <p className="text-neutral-600">Hover over me to see the lift effect</p>
            </Card>
            <Card gradient>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Gradient Card</h3>
              <p className="text-neutral-600">Card with subtle gradient background</p>
            </Card>
            <Card glass>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Glass Card</h3>
              <p className="text-neutral-600">Card with glass morphism effect</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Examples */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Example Modal"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setModalOpen(false)}>Save Changes</Button>
          </>
        }
      >
        <p className="text-neutral-600">
          This is an example modal with a title, content area, and footer with action buttons.
          You can close it by clicking the X button, pressing Escape, or clicking outside.
        </p>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          showToast('success', 'Action confirmed!')
          setConfirmOpen(false)
        }}
        title="Are you sure?"
        message="This action cannot be undone. Please confirm to proceed."
        variant="danger"
        confirmText="Yes, delete it"
        cancelText="Cancel"
      />
    </DashboardLayout>
  )
}
