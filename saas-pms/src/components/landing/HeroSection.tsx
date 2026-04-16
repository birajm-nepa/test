"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroSection({ hasSession }: { hasSession: boolean }) {
  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-indigo-50 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-6"
      >
        The Intelligent Pharmacy <br className="hidden sm:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Management System</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto mb-10"
      >
        A production-ready, multi-tenant SaaS engineered specifically for the Nepal market.
        Built with Next.js 15, Prisma, and PostgreSQL. Features built-in FEFO logic, automated VAT calculations, and DDA narcotic compliance.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center space-x-4"
      >
        <Link
          href={hasSession ? "/pos" : "/login"}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold flex items-center transition-all transform hover:scale-105 shadow-lg shadow-indigo-200"
        >
          {hasSession ? 'Launch POS Terminal' : 'Get Started'} <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
        <a
          href="#features"
          className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-semibold transition-all transform hover:scale-105 shadow-sm"
        >
          Explore Features
        </a>
      </motion.div>
    </section>
  )
}
