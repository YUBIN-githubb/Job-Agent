import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'my-job-agent',
  description: 'AI 자소서 작성 도우미',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  )
}
