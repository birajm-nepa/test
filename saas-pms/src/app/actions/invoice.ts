'use server'

import { PrismaClient, PaymentStatus, DdaCategory } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateNepalVat } from '@/utils/vatCalculator'

const prisma = new PrismaClient()

export interface CreateInvoicePayload {
  tenantId: string
  customerName?: string
  customerPhone?: string
  paymentStatus: PaymentStatus
  items: {
    medicineId: string
    batchId: string
    quantity: number
    unitPrice: string // Passed as string from client
    isVatable: boolean
  }[]
  doctorNmcNo?: string // Required if any item is CLASS_A (Narcotic)
}

export async function createInvoice(payload: CreateInvoicePayload) {
  try {
    const { tenantId, customerName, customerPhone, paymentStatus, items, doctorNmcNo } = payload

    if (!items || items.length === 0) {
      throw new Error('Invoice must contain at least one item.')
    }

    // Process all items concurrently for validation
    const processedItems = await Promise.all(
      items.map(async (item) => {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
        })

        if (!medicine || medicine.tenantId !== tenantId) {
          throw new Error(`Medicine not found: ${item.medicineId}`)
        }

        // Narcotic Validation
        if (medicine.category === DdaCategory.CLASS_A) {
          if (!doctorNmcNo) {
            throw new Error(`NMC number is required for Narcotic medicine: ${medicine.name}`)
          }
          if (!customerPhone) {
            throw new Error(`Patient phone is required for Narcotic medicine: ${medicine.name}`)
          }
        }

        // Validate selected batch has enough stock
        const batch = await prisma.stockBatch.findUnique({
          where: { id: item.batchId },
        })

        if (!batch || batch.tenantId !== tenantId) {
          throw new Error(`Batch not found for medicine: ${medicine.name}`)
        }

        if (batch.quantity < item.quantity) {
           throw new Error(`Insufficient stock for ${medicine.name} in selected batch. Available: ${batch.quantity}, Requested: ${item.quantity}.`)
        }

        const decimalUnitPrice = new Decimal(item.unitPrice)

        return {
          medicineId: item.medicineId,
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: decimalUnitPrice,
          isVatable: item.isVatable,
          totalAmount: decimalUnitPrice.mul(item.quantity),
          isNarcotic: medicine.category === DdaCategory.CLASS_A,
        }
      })
    )

    // Check if any narcotic item is present
    const hasNarcotic = processedItems.some((item) => item.isNarcotic)

    // Calculate VAT and Totals using instantiated Decimals
    const vatCalculation = calculateNepalVat(processedItems)

    // Execute Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate Unique Sequential Invoice Number robustly
      const tenantSettings = await tx.tenantSettings.upsert({
        where: { tenantId },
        update: { lastInvoiceNo: { increment: 1 } },
        create: {
          tenantId,
          lastInvoiceNo: 1,
        }
      })
      const invoiceNumber = `INV-${tenantSettings.lastInvoiceNo.toString().padStart(6, '0')}`

      // 2. Create the Invoice
      const invoice = await tx.invoice.create({
        data: {
          tenantId,
          invoiceNumber,
          customerName,
          customerPhone,
          paymentStatus,
          nonTaxableAmount: vatCalculation.nonTaxableAmount,
          taxableAmount: vatCalculation.taxableAmount,
          vatAmount: vatCalculation.vatAmount,
          grandTotal: vatCalculation.grandTotal,
          items: {
            create: processedItems.map((pi) => ({
              medicineId: pi.medicineId,
              quantity: pi.quantity,
              unitPrice: pi.unitPrice,
              isVatable: pi.isVatable,
              totalAmount: pi.totalAmount,
            })),
          },
        },
      })

      // 3. Create Narcotic Log if required
      if (hasNarcotic && doctorNmcNo && customerPhone) {
        await tx.narcoticLog.create({
          data: {
            invoiceId: invoice.id,
            patientPhone: customerPhone,
            doctorNmcNo,
          },
        })
      }

      // 4. Deduct Stock Levels exactly from the selected batch
      for (const item of processedItems) {
        await tx.stockBatch.update({
          where: { id: item.batchId },
          data: {
            quantity: { decrement: item.quantity },
          },
        })
      }

      return invoice
    })

    return { success: true, data: result }
  } catch (error: any) {
    console.error('Invoice Creation Error:', error)
    return { success: false, error: error.message }
  }
}
