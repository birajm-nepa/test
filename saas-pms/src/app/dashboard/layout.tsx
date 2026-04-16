import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Package, FileText, ShieldAlert, LogOut, Activity, Building2 } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect('/login')

  const isSuperAdmin = session.user.role === 'SUPERADMIN'

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-10">

        {/* Brand Header */}
        <div className="p-6 flex items-center space-x-3 bg-slate-950 border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="block font-bold text-white text-lg leading-tight">SaaS-PMS</span>
            <span className="block text-xs font-medium text-slate-500">Nepal Edition</span>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">

          {/* Pharmacy Controls (For Admins/Staff) */}
          {!isSuperAdmin && (
            <div className="mb-8">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3">Pharmacy Operations</div>
              <nav className="space-y-1">
                <Link href="/dashboard/pos" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group">
                  <LayoutDashboard className="h-5 w-5 mr-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  POS Terminal
                </Link>
                <Link href="/dashboard/inventory" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group">
                  <Package className="h-5 w-5 mr-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  Inventory
                </Link>
                <Link href="/dashboard/reports" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors group">
                  <FileText className="h-5 w-5 mr-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  Sales & Reports
                </Link>
              </nav>
            </div>
          )}

          {/* Global Administration (Strictly Super Admin) */}
          {isSuperAdmin && (
            <div className="mb-8">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3 flex items-center">
                <ShieldAlert className="h-4 w-4 mr-1 text-red-500" /> Global Administration
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mb-4 mx-2">
                <p className="text-xs text-red-200 leading-tight">You are viewing the global system configuration. Exercise caution.</p>
              </div>
              <nav className="space-y-1">
                <Link href="/dashboard/superadmin" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-100 hover:text-white hover:bg-red-900/50 transition-colors group">
                  <Building2 className="h-5 w-5 mr-3 text-red-400 group-hover:text-red-300 transition-colors" />
                  Manage Tenants
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
           <div className="flex items-center justify-between mb-4 px-2">
             <div className="overflow-hidden">
               <div className="text-sm font-medium text-white truncate">{session.user.name}</div>
               <div className="text-xs text-slate-500 truncate">{session.user.email}</div>
             </div>
             <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${isSuperAdmin ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
               {session.user.role}
             </span>
           </div>

           <Link href="/api/auth/signout" className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium rounded-lg text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
           </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
