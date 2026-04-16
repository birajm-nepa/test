import Link from 'next/link'
import { Activity, ShieldCheck, Calculator, ArrowRight, LayoutDashboard, LogIn } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">SaaS-PMS Nepal</span>
        </div>
        <div>
          {session ? (
            <Link href="/pos" className="flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center space-x-2 text-gray-600 font-medium hover:text-gray-900 transition-colors">
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-6">
          The Intelligent Pharmacy <br className="hidden sm:block" />
          <span className="text-indigo-600">Management System</span>
        </h1>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto mb-10">
          A production-ready, multi-tenant SaaS engineered specifically for the Nepal market.
          Built with Next.js 15, Prisma, and PostgreSQL. Features built-in FEFO logic, automated VAT calculations, and DDA narcotic compliance.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href={session ? "/pos" : "/login"} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-semibold flex items-center transition-colors shadow-lg shadow-indigo-200">
            {session ? 'Launch POS Terminal' : 'Get Started'} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <a href="#features" className="bg-gray-50 hover:bg-gray-100 text-gray-900 border border-gray-200 px-8 py-4 rounded-full font-semibold transition-colors">
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Core Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run a modern pharmacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Nepal VAT & Billing</h3>
              <p className="text-gray-600">
                Automatically calculates Non-Taxable, Taxable amounts, and strictly enforces 13% VAT. Built using Prisma Decimal to entirely prevent NPR rounding errors during high-volume sales.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">FEFO Inventory Logic</h3>
              <p className="text-gray-600">
                Intelligently suggests and deducts from batches based on First-Expire-First-Out (FEFO) rules. Visually flags expiring medicines in the POS within a 6-month threshold.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">DDA Narcotic Compliance</h3>
              <p className="text-gray-600">
                Strict validations for Class A drugs. The system enforces Doctor NMC Number and Patient Phone Number entry before allowing the generation of a narcotic invoice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100 text-center text-gray-500">
        <p>Built with Next.js 15, Prisma, PostgreSQL, and Tailwind CSS. Multi-tenant ready.</p>
      </footer>
    </div>
  )
}
