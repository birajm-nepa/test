import { PrismaClient, DdaCategory, UnitType } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding initial data...')

  // Create a default tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Everest Pharmacy',
      ddaLicenseNo: 'DDA-12345',
      panVatNo: '100200300',
      address: 'Kathmandu, Nepal',
      tenantSettings: {
        create: {
          lastInvoiceNo: 0,
        },
      },
    },
  })

  console.log(`Created Tenant: ${tenant.name} (${tenant.id})`)

  // Create an admin user
  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Admin User',
      email: 'admin@everestpharmacy.com',
      role: 'ADMIN',
    },
  })

  console.log(`Created Admin User: ${admin.email}`)

  // Create Medicines
  const paracetamol = await prisma.medicine.create({
    data: {
      tenantId: tenant.id,
      name: 'Niko',
      composition: 'Paracetamol 500mg',
      category: DdaCategory.CLASS_C,
      unitType: UnitType.TABLET,
    },
  })

  const morphine = await prisma.medicine.create({
    data: {
      tenantId: tenant.id,
      name: 'Morphine Sulfate',
      composition: 'Morphine 10mg/ml',
      category: DdaCategory.CLASS_A, // Narcotic
      unitType: UnitType.VIAL,
    },
  })

  console.log('Created Medicines')

  // Create Stock Batches
  await prisma.stockBatch.create({
    data: {
      tenantId: tenant.id,
      medicineId: paracetamol.id,
      batchNumber: 'B-001',
      mfgDate: new Date('2023-01-01'),
      expDate: new Date('2025-01-01'), // Expiring soon
      costPrice: new Decimal(2.5),
      sellingPrice: new Decimal(3.5),
      quantity: 1000,
    },
  })

  await prisma.stockBatch.create({
    data: {
      tenantId: tenant.id,
      medicineId: morphine.id,
      batchNumber: 'M-001',
      mfgDate: new Date('2024-01-01'),
      expDate: new Date('2026-01-01'),
      costPrice: new Decimal(150),
      sellingPrice: new Decimal(200),
      quantity: 50,
    },
  })

  console.log('Created StockBatches')
  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
