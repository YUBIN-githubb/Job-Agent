// Design Ref: §7 — Auth guard: 미인증 시 /login 리다이렉트
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Navbar from '@/components/layout/Navbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={session.user} />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}
