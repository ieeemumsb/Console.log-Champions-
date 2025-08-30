"use client"
import { RedirectToSignIn } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import React from 'react'
import { Navbar } from './_components/Navbar'


const layout = ({children}:{children: React.ReactNode}) => {
  return (
    <>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
      <Authenticated>
        <Navbar />
        <main className="pt-16 px-6 max-w-full">{children}</main>
      </Authenticated>
    </>
  );
}

export default layout