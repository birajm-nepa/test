import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Retrieves available stock batches for a given medicine,
 * sorted by First Expire First Out (FEFO), excluding expired batches.
 */
export async function getAvailableStock(medicineId: string, tenantId: string) {
  const currentDate = new Date()

  const availableBatches = await prisma.stockBatch.findMany({
    where: {
      medicineId,
      tenantId,
      quantity: {
        gt: 0, // Must have quantity greater than 0
      },
      expDate: {
        gt: currentDate, // Must not be expired
      },
    },
    orderBy: {
      expDate: 'asc', // First to expire comes first
    },
  })

  return availableBatches
}
