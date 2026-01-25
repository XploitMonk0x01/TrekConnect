import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import AdminLayoutClient from './AdminLayoutClient'

export const metadata = {
  title: 'Admin Dashboard | TrekConnect',
  description: 'Manage TrekConnect destinations and content',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
