'use server'

import { PrismaClient, PaymentStatus, DdaCategory } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { calculateNepalVat } from '@/utils/vatCalculator'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'

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
    isVatable: boolean
  }[]
  doctorNmcNo?: string // Required if any item is CLASS_A (Narcotic)
}

export async function createInvoice(payload: CreateInvoicePayload) {
  try {
    // 1. Authentication & Authorization Check
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      throw new Error('Unauthorized: You must be logged in to perform this action.')
    }

    const { tenantId, customerName, customerPhone, paymentStatus, items, doctorNmcNo } = payload

    // 2. Tenant Isolation Enforcement
    if (session.user.tenantId !== tenantId) {
      throw new Error('Forbidden: You do not have permission to create invoices for this tenant.')
    }

    if (!items || items.length === 0) {
      throw new Error('Invoice must contain at least one item.')
    }

    // 3. Process all items securely (Fetch truth from DB, do not trust client pricing)
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

        // Validate selected batch has enough stock and fetch the AUTHORITATIVE selling price
        const batch = await prisma.stockBatch.findUnique({
          where: { id: item.batchId },
        })

        if (!batch || batch.tenantId !== tenantId) {
          throw new Error(`Batch not found for medicine: ${medicine.name}`)
        }

        if (batch.quantity < item.quantity) {
           throw new Error(`Insufficient stock for ${medicine.name} in selected batch. Available: ${batch.quantity}, Requested: ${item.quantity}.`)
        }

        const authoritativePrice = batch.sellingPrice

        return {
          medicineId: item.medicineId,
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: authoritativePrice, // Use DB price securely
          isVatable: item.isVatable,
          totalAmount: authoritativePrice.mul(item.quantity),
          isNarcotic: medicine.category === DdaCategory.CLASS_A,
        }
      })
    )

    // Check if any narcotic item is present
    const hasNarcotic = processedItems.some((item) => item.isNarcotic)

    // Calculate VAT and Totals using instantiated Decimals
    const vatCalculation = calculateNepalVat(
      processedItems.map(p => ({
        unitPrice: p.unitPrice,
        quantity: p.quantity,
        isVatable: p.isVatable
      }))
    )

    // Execute Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate Unique Sequential Invoice Number robustly
      const tenantSettings = await tx.tenantSettings.upsert({
        where: { tenantId },
        update: { lastInvoiceNo: { increment: 1 } },
        create: {
          tenantId,
          lastInvoiceNo: 1,
        }
      })
      const invoiceNumber = `INV-${tenantSettings.lastInvoiceNo.toString().padStart(6, '0')}`

      // Create the Invoice
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

      // Create Narcotic Log if required
      if (hasNarcotic && doctorNmcNo && customerPhone) {
        await tx.narcoticLog.create({
          data: {
            invoiceId: invoice.id,
            patientPhone: customerPhone,
            doctorNmcNo,
          },
        })
      }

      // Deduct Stock Levels exactly from the selected batch
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
