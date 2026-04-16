'use server'

import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function createTenant(data: {
  pharmacyName: string
  ddaLicenseNo: string
  panVatNo: string
  adminName: string
  adminEmail: string
  adminPasswordRaw: string
}) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SUPERADMIN') {
    throw new Error('Forbidden: Only Global Super Admins can create new tenants.')
  }

  try {
    const hashedPassword = await bcrypt.hash(data.adminPasswordRaw, 10)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the new Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.pharmacyName,
          ddaLicenseNo: data.ddaLicenseNo,
          panVatNo: data.panVatNo,
          tenantSettings: {
            create: { lastInvoiceNo: 0 }
          }
        }
      })

      // 2. Provision the Admin User for this new Tenant
      await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        }
      })

      return tenant
    })

    return { success: true, tenantId: result.id }
  } catch (error: any) {
    console.error('Tenant Creation Error:', error)
    return { success: false, error: error.message }
  }
}
