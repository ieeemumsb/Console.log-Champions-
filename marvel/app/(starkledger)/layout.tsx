'use client'

import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { ThemeProvider } from '@/providers/theme-provider'

import { Authenticated, Unauthenticated } from 'convex/react'
import { Navbar } from '@/app/(starkledger)/_components/navbar'



export default function StarkLedgerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
      </Authenticated>
    </>
  )
}