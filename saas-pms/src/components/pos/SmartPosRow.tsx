'use client'

import React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BatchOption {
  id: string
  batchNumber: string
  expDate: Date
  quantity: number
  sellingPrice: string
}

interface SmartPosRowProps {
  index: number
  remove: (index: number) => void
  medicines: { id: string; name: string }[]
  availableBatches: Record<string, BatchOption[]> // Map of medicineId -> batches
}

export function SmartPosRow({ index, remove, medicines, availableBatches }: SmartPosRowProps) {
  const { register, setValue, control } = useFormContext()

  // Watch values for dynamic updates
  const selectedMedicineId = useWatch({ control, name: `items.${index}.medicineId` })
  const selectedBatchId = useWatch({ control, name: `items.${index}.batchId` })
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const unitPrice = useWatch({ control, name: `items.${index}.unitPrice` })
  const isVatable = useWatch({ control, name: `items.${index}.isVatable` })

  const batchesForMedicine = selectedMedicineId ? availableBatches[selectedMedicineId] || [] : []
  const selectedBatch = batchesForMedicine.find((b) => b.id === selectedBatchId)

  // Determine if batch is expiring within 6 months
  const isExpiringSoon = React.useMemo(() => {
    if (!selectedBatch) return false
    const sixMonthsFromNow = new Date()
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6)
    return new Date(selectedBatch.expDate) <= sixMonthsFromNow
  }, [selectedBatch])

  // Handle batch selection to auto-fill price
  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchId = e.target.value
    setValue(`items.${index}.batchId`, batchId)
    const batch = batchesForMedicine.find((b) => b.id === batchId)
    if (batch) {
       setValue(`items.${index}.unitPrice`, batch.sellingPrice)
    }
  }

  // Calculate total for this row
  const total = React.useMemo(() => {
    const q = parseFloat(quantity || '0')
    const p = parseFloat(unitPrice || '0')
    return (q * p).toFixed(2)
  }, [quantity, unitPrice])

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-white shadow-sm mb-4">
      {/* Medicine Selection */}
      <div className="flex-1 min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
        <select
          {...register(`items.${index}.medicineId`)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        >
          <option value="">Select Medicine...</option>
          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Batch Selection */}
      <div className="flex-1 min-w-[200px]">
        <label className={cn("block text-sm font-medium mb-1", isExpiringSoon ? "text-red-600 font-bold" : "text-gray-700")}>
          Batch {isExpiringSoon && "(Expiring Soon)"}
        </label>
        <select
          value={selectedBatchId || ''}
          onChange={handleBatchChange}
          disabled={!selectedMedicineId}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border",
            isExpiringSoon && "border-red-300 bg-red-50 text-red-900"
          )}
        >
          <option value="">Select Batch...</option>
          {batchesForMedicine.map((b) => (
            <option key={b.id} value={b.id}>
              {b.batchNumber} (Stock: {b.quantity})
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="w-24">
        <label className="block text-sm font-medium text-gray-700 mb-1">Qty</label>
        <input
          type="number"
          min="1"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
      </div>

      {/* Price */}
      <div className="w-32">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price (NPR)</label>
        <input
          type="number"
          step="0.01"
          readOnly
          {...register(`items.${index}.unitPrice`)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-gray-50"
        />
      </div>

      {/* VAT Toggle */}
      <div className="flex items-center w-20 justify-center h-10 mb-1">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            {...register(`items.${index}.isVatable`)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
          />
          <span className="text-sm font-medium text-gray-700">VAT</span>
        </label>
      </div>

      {/* Row Total */}
      <div className="w-32 text-right">
        <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
        <div className="h-10 flex items-center justify-end font-semibold text-gray-900">
          NPR {total}
        </div>
      </div>

      {/* Remove Button */}
      <div className="mb-1">
        <button
          type="button"
          onClick={() => remove(index)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}
