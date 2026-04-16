'use client'

import { useState } from 'react'
import { createTenant } from '@/app/actions/tenant'
import { useRouter } from 'next/navigation'

export function CreateTenantForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ type: '', text: '' })

    const formData = new FormData(e.currentTarget)
    const data = {
      pharmacyName: formData.get('pharmacyName') as string,
      ddaLicenseNo: formData.get('ddaLicenseNo') as string,
      panVatNo: formData.get('panVatNo') as string,
      adminName: formData.get('adminName') as string,
      adminEmail: formData.get('adminEmail') as string,
      adminPasswordRaw: formData.get('adminPassword') as string,
    }

    const result = await createTenant(data)
    if (result.success) {
      setMsg({ type: 'success', text: 'Pharmacy successfully registered!' })
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    } else {
      setMsg({ type: 'error', text: result.error || 'Registration failed.' })
    }
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {msg.text && (
        <div className={`p-3 text-sm rounded ${msg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {msg.text}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
        <input required name="pharmacyName" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">DDA License No.</label>
          <input required name="ddaLicenseNo" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">PAN / VAT No.</label>
          <input required name="panVatNo" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <hr className="my-4" />
      <h3 className="font-semibold text-gray-900">Admin Account Provisioning</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700">Admin Full Name</label>
        <input required name="adminName" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Admin Email</label>
          <input required name="adminEmail" type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Initial Password</label>
          <input required name="adminPassword" type="password" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50 font-medium">
        {isSubmitting ? 'Registering...' : 'Register Pharmacy & Provision Admin'}
      </button>
    </form>
  )
}
