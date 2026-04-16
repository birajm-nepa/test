'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User, Activity } from 'lucide-react'
import Link from 'next/link'

export default function PosHeader({ user, tenantName }: { user: any; tenantName: string }) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-3">
        <Link href="/">
          <Activity className="h-6 w-6 text-indigo-600 hover:text-indigo-800 transition-colors" />
        </Link>
        <div className="h-6 w-px bg-gray-300"></div>
        <span className="font-bold text-gray-900 text-lg">{tenantName}</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span className="font-medium mr-2">{user.name}</span>
          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold">
            {user.role}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center text-sm text-red-600 hover:text-red-800 transition-colors font-medium"
        >
          <LogOut className="h-4 w-4 mr-1" /> Logout
        </button>
      </div>
    </header>
  )
}
