"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default function TrackEntryPage() {
  const [trackingId, setTrackingId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = trackingId.trim()

    if (!UUID_REGEX.test(trimmed)) {
      setError("Ugyldigt sporings-ID. Tjek venligst dit ID og prøv igen.")
      return
    }

    setError(null)
    router.push(`/track/${trimmed}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo className="h-10" />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Spor din ordre</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Indtast dit sporings-ID for at se status på din bestilling.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Sporings-ID"
                value={trackingId}
                onChange={(e) => {
                  setTrackingId(e.target.value)
                  setError(null)
                }}
              />
              {error && (
                <p className="text-sm text-red-500 mt-2">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Spor ordre
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
