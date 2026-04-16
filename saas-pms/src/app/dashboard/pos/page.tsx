import { PosBillingPage } from '@/components/pos/PosBillingPage'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

const prisma = new PrismaClient()

export default async function PosTerminalPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const tenantId = session.user.tenantId

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      medicines: true,
      stockBatches: {
        where: {
          quantity: { gt: 0 },
          expDate: { gt: new Date() } // FEFO: Exclude inherently expired batches
        },
        orderBy: { expDate: 'asc' }, // Pre-sort by FEFO
      },
    },
  })

  if (!tenant) {
    return <div className="p-10 text-center text-red-600">Tenant configuration error.</div>
  }

  // Group batches by medicineId
  const availableBatches = tenant.stockBatches.reduce((acc, batch) => {
    if (!acc[batch.medicineId]) acc[batch.medicineId] = []
    acc[batch.medicineId].push({
      id: batch.id,
      batchNumber: batch.batchNumber,
      expDate: batch.expDate,
      quantity: batch.quantity,
      sellingPrice: batch.sellingPrice.toString(),
    })
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Point of Sale (POS)</h1>
        <p className="text-gray-600">
          DDA License: <span className="font-medium text-gray-900">{tenant.ddaLicenseNo}</span> |
          PAN/VAT: <span className="font-medium text-gray-900">{tenant.panVatNo}</span>
        </p>
      </div>

      <PosBillingPage
        tenantId={tenant.id}
        medicines={tenant.medicines}
        availableBatches={availableBatches}
      />
    </div>
  )
}
