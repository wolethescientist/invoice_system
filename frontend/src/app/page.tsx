'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/Button'
import { useEffect, useState } from 'react'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-brand-200 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-brand-300 to-transparent rounded-full blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative container mx-auto px-6 py-6 flex justify-between items-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold text-brand-500 cursor-pointer"
        >
          InvoiceSystem
        </motion.div>
        <Link href="/auth/login">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="primary">Get Started</Button>
          </motion.div>
        </Link>
      </motion.nav>

      {/* Hero Section */}
      <motion.main style={{ opacity, scale }} className="relative container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="bg-brand-100 text-brand-600 px-4 py-2 rounded-full text-sm font-semibold">
              ✨ Professional Invoicing Solution
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-7xl md:text-8xl font-bold text-neutral-900 mb-6 leading-tight"
          >
            Invoice Smarter,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-600">
              Get Paid Faster
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create stunning invoices in seconds, track payments effortlessly, and manage your business finances with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/auth/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="primary" className="text-lg px-10 py-4 shadow-xl">
                  Start Free Trial
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="secondary" className="text-lg px-10 py-4">
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-sm text-neutral-500 mt-6"
          >
            No credit card required • Free 14-day trial • Cancel anytime
          </motion.p>
        </motion.div>

        {/* Floating Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <motion.div
            animate={floatingAnimation}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 rounded-2xl blur-3xl opacity-20" />
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="relative bg-white rounded-2xl shadow-2xl p-4 border border-neutral-200"
            >
              <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-neutral-600 font-medium">Dashboard Preview</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.main>

      {/* Features Section */}
      <section className="relative py-32 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-neutral-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful features designed to streamline your invoicing workflow
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Instant PDF Generation',
                description: 'Create beautiful, professional invoices as PDFs with a single click. Customizable templates that match your brand.',
                icon: '📄',
                color: 'from-blue-500 to-blue-600',
              },
              {
                title: 'Real-time Analytics',
                description: 'Track outstanding payments, overdue invoices, and monthly revenue with live dashboards and insights.',
                icon: '📊',
                color: 'from-purple-500 to-purple-600',
              },
              {
                title: 'Smart Automation',
                description: 'Automated payment reminders, recurring invoices, and intelligent follow-ups to save you time.',
                icon: '⚡',
                color: 'from-orange-500 to-orange-600',
              },
              {
                title: 'Customer Management',
                description: 'Organize all your clients in one place with detailed profiles, payment history, and contact information.',
                icon: '👥',
                color: 'from-green-500 to-green-600',
              },
              {
                title: 'Payment Tracking',
                description: 'Monitor payment status, send reminders, and keep track of every transaction with ease.',
                icon: '💳',
                color: 'from-pink-500 to-pink-600',
              },
              {
                title: 'Secure & Reliable',
                description: 'Bank-level security with encrypted data storage and automatic backups to keep your information safe.',
                icon: '🔒',
                color: 'from-red-500 to-red-600',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-neutral-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-neutral-100 group"
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-3xl mb-6 shadow-lg`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 group-hover:text-brand-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 bg-gradient-to-br from-brand-500 to-brand-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid md:grid-cols-4 gap-12 text-center"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500K+', label: 'Invoices Created' },
              { value: '99.9%', label: 'Uptime' },
              { value: '$50M+', label: 'Processed' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                  className="text-5xl font-bold mb-2"
                >
                  {stat.value}
                </motion.div>
                <div className="text-brand-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-32 bg-neutral-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-neutral-900 mb-4">
              Loved by Businesses
            </h2>
            <p className="text-xl text-neutral-600">
              See what our customers have to say
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                quote: "This invoicing system transformed how we handle billing. We've reduced payment delays by 60%!",
                author: "Sarah Johnson",
                role: "Founder, Design Studio",
              },
              {
                quote: "The automation features save us hours every week. Best investment we've made for our business.",
                author: "Michael Chen",
                role: "CEO, Tech Startup",
              },
              {
                quote: "Clean interface, powerful features, and excellent support. Couldn't ask for more!",
                author: "Emily Rodriguez",
                role: "Freelance Consultant",
              },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="text-4xl mb-4">⭐⭐⭐⭐⭐</div>
                <p className="text-neutral-700 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-neutral-200 pt-4">
                  <p className="font-bold text-neutral-900">{testimonial.author}</p>
                  <p className="text-sm text-neutral-600">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-brand-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-300 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative container mx-auto px-6 text-center"
        >
          <h2 className="text-6xl font-bold text-neutral-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-2xl text-neutral-600 mb-12 max-w-3xl mx-auto">
            Join thousands of businesses already using InvoiceSystem to streamline their billing
          </p>
          <Link href="/auth/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Button variant="primary" className="text-xl px-12 py-5 shadow-2xl">
                Start Your Free Trial
              </Button>
            </motion.div>
          </Link>
          <p className="text-neutral-500 mt-6">
            No credit card required • 14-day free trial
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative bg-neutral-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-brand-400">InvoiceSystem</h3>
              <p className="text-neutral-400">
                Professional invoicing made simple and beautiful.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 InvoiceSystem. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
