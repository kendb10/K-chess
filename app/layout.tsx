import type { Metadata } from 'next'
import Link from 'next/link'
import { Inter } from 'next/font/google'
import { isAuthenticated } from '@/lib/auth'
import LogoutButton from '@/components/LogoutButton'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'K-Chess | My Chess Study Blog',
  description: 'A personal chess game study log',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const canEdit = isAuthenticated()

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              K-Chess
            </Link>
            <div className="flex items-center gap-4">
              {canEdit ? (
                <>
                  <Link
                    href="/new"
                    className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    + New Game
                  </Link>
                  <LogoutButton />
                </>
              ) : (
                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">{children}</main>
      </body>
    </html>
  )
}
