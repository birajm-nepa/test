import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { Package, AlertTriangle } from 'lucide-react'

const prisma = new PrismaClient()

export default async function InventoryPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect('/login')

  const tenantId = session.user.tenantId

  const medicines = await prisma.medicine.findMany({
    where: { tenantId },
    include: {
      stockBatches: {
        orderBy: { expDate: 'asc' }
      }
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Package className="mr-2" /> Inventory Management
        </h1>
        <p className="text-gray-600">Track medicines, view stock batches, and monitor expirations.</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Batches</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((med) => {
              const totalStock = med.stockBatches.reduce((acc, b) => acc + b.quantity, 0)

              // Check if any batch is expiring within 6 months
              const sixMonthsFromNow = new Date()
              sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
              const hasExpiringBatch = med.stockBatches.some(b => b.quantity > 0 && b.expDate <= sixMonthsFromNow)

              return (
                <tr key={med.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {med.name}
                      {hasExpiringBatch && <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />}
                    </div>
                    <div className="text-sm text-gray-500">{med.composition}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      med.category === 'CLASS_A' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {med.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    {totalStock} {med.unitType.toLowerCase()}s
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {med.stockBatches.map(batch => (
                        <div key={batch.id} className="text-xs text-gray-600 bg-gray-50 p-1 rounded border">
                          Batch: <span className="font-medium">{batch.batchNumber}</span> |
                          Qty: <span className="font-medium">{batch.quantity}</span> |
                          Exp: <span className={batch.expDate <= sixMonthsFromNow ? 'text-red-600 font-bold' : ''}>
                            {batch.expDate.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )
            })}
            {medicines.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No inventory found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
