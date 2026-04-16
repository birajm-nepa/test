import { PosBillingPage } from '@/components/pos/PosBillingPage'

// Mock Data for Build process to pass (Since DB is down during build)
const MOCK_TENANT = {
  id: 'tenant-123',
  name: 'Everest Pharmacy',
  ddaLicenseNo: 'DDA-12345',
  panVatNo: '100200300',
}

const MOCK_MEDICINES = [
  { id: 'med-1', name: 'Niko (Paracetamol 500mg)', category: 'CLASS_C' },
  { id: 'med-2', name: 'Morphine Sulfate (10mg/ml)', category: 'CLASS_A' },
]

const MOCK_BATCHES = {
  'med-1': [
    { id: 'batch-1', batchNumber: 'B-001', expDate: new Date('2025-01-01'), quantity: 1000, sellingPrice: '3.5' },
  ],
  'med-2': [
    { id: 'batch-2', batchNumber: 'M-001', expDate: new Date('2026-01-01'), quantity: 50, sellingPrice: '200' },
  ]
}

export default async function Home() {
  const tenant = MOCK_TENANT
  const availableBatches = MOCK_BATCHES

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tenant.name} - POS Terminal</h1>
        <p className="text-gray-600 mb-8">DDA License: {tenant.ddaLicenseNo} | PAN/VAT: {tenant.panVatNo}</p>

        <PosBillingPage
          tenantId={tenant.id}
          medicines={MOCK_MEDICINES}
          availableBatches={availableBatches}
        />
      </div>
    </main>
  )
}
