import Link from 'next/link'
import { Activity, LayoutDashboard, LogIn } from 'lucide-react'
import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'

// Import newly created client components
import { HeroSection } from '@/components/landing/HeroSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { RoadmapSection } from '@/components/landing/RoadmapSection'

export default async function LandingPage() {
  const session = await getServerSession(authOptions)
  const hasSession = !!session

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 px-8 flex justify-between items-center transition-all">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            SaaS-PMS Nepal
          </span>
        </div>
        <div>
          {hasSession ? (
            <Link
              href="/pos"
              className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-2 text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </nav>

      <main>
        <HeroSection hasSession={hasSession} />
        <FeaturesSection />
        <RoadmapSection />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Activity className="h-6 w-6 text-gray-400" />
            <span className="text-gray-500 font-medium">SaaS-PMS Nepal</span>
          </div>
          <p className="text-gray-500 text-sm text-center md:text-left mb-4 md:mb-0">
            Built with Next.js 15, Prisma, PostgreSQL, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  )
}
