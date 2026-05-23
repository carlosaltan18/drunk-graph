import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AdminSplash } from '@/components/magicpath/admin-login-splash/AdminSplash'

export default async function AdminLoginPage() {
  const session = await adminAuth.api.getSession({ headers: await headers() })
  if (session) redirect('/admin/dashboard')

  return (
    <Suspense>
      <AdminSplash />
    </Suspense>
  )
}
