// Design Ref: §7 — NextAuth middleware: /dashboard/** 전체 인증 강제
export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/(dashboard)/:path*', '/dashboard/:path*'],
}
