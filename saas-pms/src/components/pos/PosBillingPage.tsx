'use client'

import React, { useState } from 'react'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Receipt } from 'lucide-react'
import { SmartPosRow } from './SmartPosRow'
import { createInvoice } from '@/app/actions/invoice'
import { PaymentStatus, DdaCategory } from '@prisma/client'

// Zod Schema for strict validation
const invoiceSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentStatus: z.nativeEnum(PaymentStatus),
  doctorNmcNo: z.string().optional(),
  items: z.array(
    z.object({
      medicineId: z.string().min(1, 'Medicine is required'),
      batchId: z.string().min(1, 'Batch is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.string().min(1, 'Price is required'),
      isVatable: z.boolean(),
    })
  ).min(1, 'At least one item is required'),
})

type InvoiceFormValues = z.infer<typeof invoiceSchema>

interface PosBillingPageProps {
  tenantId: string
  medicines: { id: string; name: string; category: string }[]
  availableBatches: Record<string, any[]>
}

export function PosBillingPage({ tenantId, medicines, availableBatches }: PosBillingPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      paymentStatus: 'PAID',
      doctorNmcNo: '',
      items: [{ medicineId: '', batchId: '', quantity: 1, unitPrice: '0', isVatable: false }],
    },
  })

  const { control, handleSubmit, watch, reset } = methods
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const formItems = watch('items')

  // Check if any selected medicine is Narcotic (CLASS_A)
  const hasNarcotic = formItems.some(item => {
    const med = medicines.find(m => m.id === item.medicineId)
    return med?.category === DdaCategory.CLASS_A
  })

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    // Prepare payload with Decimal-compatible strings
    const payload = {
      tenantId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      paymentStatus: data.paymentStatus,
      doctorNmcNo: data.doctorNmcNo,
      items: data.items.map(item => ({
        medicineId: item.medicineId, batchId: item.batchId,
        quantity: item.quantity,
        unitPrice: item.unitPrice as any, // Passed to server to convert to Prisma Decimal
        isVatable: item.isVatable,
      }))
    }

    const result = await createInvoice(payload)

    if (result.success) {
      setSuccessMsg(`Invoice generated successfully! Invoice No: ${result.data?.invoiceNumber}`)
      reset() // Reset form
    } else {
      setErrorMsg(result.error || 'An error occurred while creating the invoice.')
    }

    setIsSubmitting(false)
  }

  // Calculate live totals for display
  const liveTotals = formItems.reduce(
    (acc, item) => {
      const total = parseFloat(item.unitPrice || '0') * item.quantity
      if (item.isVatable) {
        acc.taxable += total
      } else {
        acc.nonTaxable += total
      }
      return acc
    },
    { nonTaxable: 0, taxable: 0 }
  )

  const vatAmount = liveTotals.taxable * 0.13
  const grandTotal = liveTotals.nonTaxable + liveTotals.taxable + vatAmount

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Customer Details & Compliance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
            <input {...methods.register('customerName')} className="w-full border rounded p-2" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
            <input {...methods.register('customerPhone')} className="w-full border rounded p-2" placeholder="98XXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select {...methods.register('paymentStatus')} className="w-full border rounded p-2">
              <option value="PAID">Paid</option>
              <option value="CREDIT">Credit</option>
            </select>
          </div>

          {hasNarcotic && (
            <div>
              <label className="block text-sm font-bold text-red-600 mb-1">Doctor NMC No. (Narcotic Req.)</label>
              <input {...methods.register('doctorNmcNo')} className="w-full border border-red-300 rounded p-2 focus:ring-red-500" placeholder="e.g. 12345" />
            </div>
          )}
        </div>

        {/* Dynamic POS Rows */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <SmartPosRow
              key={field.id}
              index={index}
              remove={remove}
              medicines={medicines}
              availableBatches={availableBatches}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => append({ medicineId: '', batchId: '', quantity: 1, unitPrice: '0', isVatable: false })}
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <Plus size={20} className="mr-1" /> Add Item
        </button>

        {/* Totals & Submit */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-end">
          <div className="text-gray-600 w-full md:w-1/2 space-y-1 mb-4 md:mb-0">
             <div className="flex justify-between"><span>Non-Taxable Amount:</span> <span>NPR {liveTotals.nonTaxable.toFixed(2)}</span></div>
             <div className="flex justify-between"><span>Taxable Amount:</span> <span>NPR {liveTotals.taxable.toFixed(2)}</span></div>
             <div className="flex justify-between"><span>VAT (13%):</span> <span>NPR {vatAmount.toFixed(2)}</span></div>
          </div>

          <div className="w-full md:w-auto text-right">
             <div className="text-sm text-gray-500 mb-1">Grand Total</div>
             <div className="text-4xl font-bold text-gray-900 mb-4">NPR {grandTotal.toFixed(2)}</div>

             {errorMsg && <div className="text-red-600 text-sm mb-2">{errorMsg}</div>}
             {successMsg && <div className="text-green-600 text-sm mb-2">{successMsg}</div>}

             <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                <Receipt className="mr-2" />
                {isSubmitting ? 'Generating Invoice...' : 'Generate Invoice'}
             </button>
          </div>
        </div>

      </form>
    </FormProvider>
  )
}
