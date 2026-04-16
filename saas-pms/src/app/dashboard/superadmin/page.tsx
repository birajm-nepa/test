import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { ShieldAlert, Building2, Users } from 'lucide-react'
import { CreateTenantForm } from './CreateTenantForm'

const prisma = new PrismaClient()

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard/pos') // Bounce non-superadmins
  }

  // Fetch all tenants EXCLUDING the Global System Tenant
  const tenants = await prisma.tenant.findMany({
    where: {
      users: { none: { role: 'SUPERADMIN' as const } } // Exclude the system tenant
    },
    include: {
      _count: {
        select: { users: true, invoices: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center tracking-tight">
          <ShieldAlert className="mr-3 h-8 w-8 text-red-600" /> Tenant Management Hub
        </h1>
        <p className="text-gray-500 mt-2 text-lg">Register new pharmacies, provision admin accounts, and monitor system-wide usage.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Registration Form Column */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-200 sticky top-8">
            <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <Building2 className="h-5 w-5 text-indigo-700"/>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Register New Pharmacy</h2>
            </div>
            <CreateTenantForm />
          </div>
        </div>

        {/* Existing Tenants List Column */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Active Pharmacies ({tenants.length})</h2>
          </div>

          <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
            {tenants.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No Pharmacies Registered</p>
                <p className="text-sm">Use the form on the left to onboard your first client.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tenants.map(t => (
                  <li key={t.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <span className="font-semibold mr-1 text-gray-700">DDA:</span> {t.ddaLicenseNo || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <span className="font-semibold mr-1 text-gray-700">PAN:</span> {t.panVatNo || 'N/A'}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-400 font-mono">
                          Tenant ID: {t.id}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 mb-2">
                          <Users className="h-3 w-3 mr-1" /> {t._count.users} Users
                        </div>
                        <div className="block text-sm text-gray-500 font-medium">
                          {t._count.invoices} Invoices Processed
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
