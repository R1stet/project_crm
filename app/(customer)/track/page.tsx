"use client"

import { Logo } from "@/components/logo"
import { EmailLookupForm } from "@/components/tracking/email-lookup-form"

export default function TrackEntryPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo className="h-10" />
      </div>
      <EmailLookupForm />
    </div>
  )
}
