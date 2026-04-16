import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'

const prisma = new PrismaClient()

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect('/login')

  const tenantId = session.user.tenantId

  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    include: {
      narcoticLog: true,
      items: {
        include: { medicine: true }
      }
    }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-2 text-indigo-600" /> Sales Reports & Invoices
        </h1>
        <p className="text-gray-600 mt-1">Review historical transactions, VAT breakdowns, and DDA Narcotic logs.</p>
      </div>

      <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice No.</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Grand Total (NPR)</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{inv.invoiceNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{inv.createdAt.toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">{inv.customerName || 'Walk-in Customer'}</div>
                  {inv.customerPhone && <div className="text-xs text-gray-500">{inv.customerPhone}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    inv.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {inv.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {inv.grandTotal.toString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="text-xs">Taxable: <span className="font-semibold text-gray-700">{inv.taxableAmount.toString()}</span></div>
                  <div className="text-xs">VAT (13%): <span className="font-semibold text-gray-700">{inv.vatAmount.toString()}</span></div>
                  {inv.narcoticLog && (
                    <div className="text-xs text-red-600 font-bold mt-1.5 flex items-center bg-red-50 inline-block px-1 rounded">
                      NMC Logged: {inv.narcoticLog.doctorNmcNo}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No invoices generated yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
