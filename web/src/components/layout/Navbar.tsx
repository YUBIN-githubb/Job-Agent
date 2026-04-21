// Design Ref: §5.3 — Navigation bar
import Link from 'next/link'
import { signOut } from '@/lib/auth'

interface NavbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/episodes" className="text-base font-semibold text-gray-900">
            my-job-agent
          </Link>
          <div className="flex gap-4 text-sm text-gray-600">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              대시보드
            </Link>
            <Link href="/episodes" className="hover:text-gray-900 transition-colors">
              에피소드
            </Link>
            <Link href="/jobs" className="hover:text-gray-900 transition-colors">
              공고
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.name ?? user.email}</span>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <button
              type="submit"
              className="rounded-md px-3 py-1.5 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
            >
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
