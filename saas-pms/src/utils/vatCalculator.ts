import { Decimal } from '@prisma/client/runtime/library'

export interface VatCalculationResult {
  nonTaxableAmount: Decimal
  taxableAmount: Decimal
  vatAmount: Decimal
  grandTotal: Decimal
}

export interface InvoiceItemInput {
  unitPrice: Decimal
  quantity: number
  isVatable: boolean
  discount?: Decimal // Optional discount on the item
}

/**
 * Calculates Nepal VAT (13%) breakdown for an invoice.
 */
export function calculateNepalVat(items: InvoiceItemInput[]): VatCalculationResult {
  let nonTaxableAmount = new Decimal(0)
  let taxableAmount = new Decimal(0)
  let vatAmount = new Decimal(0)

  for (const item of items) {
    const itemTotal = item.unitPrice.mul(item.quantity)
    const discount = item.discount || new Decimal(0)
    const totalAfterDiscount = itemTotal.sub(discount)

    if (item.isVatable) {
      taxableAmount = taxableAmount.add(totalAfterDiscount)
    } else {
      nonTaxableAmount = nonTaxableAmount.add(totalAfterDiscount)
    }
  }

  // Calculate 13% VAT on the taxable amount
  vatAmount = taxableAmount.mul(0.13)

  // Calculate Grand Total
  const grandTotal = nonTaxableAmount.add(taxableAmount).add(vatAmount)

  return {
    nonTaxableAmount,
    taxableAmount,
    vatAmount,
    grandTotal,
  }
}
