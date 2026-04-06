"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { OrderStatusCard } from "@/components/tracking/order-status-card"

type Step = "input" | "verify" | "results"

interface Order {
  name: string
  status: string
  dress: string | null
  expected_delivery_date: string | null
  wedding_date: string | null
}

export function EmailLookupForm() {
  const [step, setStep] = useState<Step>("input")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleRequestCode = useCallback(async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/tracking/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneNumber }),
      })

      if (res.status === 429) {
        const data = await res.json()
        setError(data.error)
        return
      }

      if (res.status === 400) {
        const data = await res.json()
        setError(data.error)
        return
      }

      setStep("verify")
      setCooldown(60)
    } catch {
      setError("Noget gik galt. Prøv venligst igen.")
    } finally {
      setLoading(false)
    }
  }, [email, phoneNumber])

  const handleSubmitEmail = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email er påkrævet")
      return
    }
    if (!phoneNumber.trim()) {
      setError("Telefonnummer er påkrævet")
      return
    }

    handleRequestCode()
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/tracking/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phoneNumber, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setOrders(data.orders)
      setStep("results")
    } catch {
      setError("Noget gik galt. Prøv venligst igen.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = () => {
    setCode("")
    setError(null)
    setCooldown(60)
    handleRequestCode()
  }

  const handleReset = () => {
    setStep("input")
    setEmail("")
    setPhoneNumber("")
    setCode("")
    setError(null)
    setOrders([])
    setCooldown(0)
  }

  if (step === "results") {
    return (
      <div className="space-y-6 w-full max-w-lg">
        {orders.map((order, i) => (
          <OrderStatusCard
            key={i}
            name={order.name}
            status={order.status}
            dress={order.dress}
            expectedDeliveryDate={order.expected_delivery_date}
            weddingDate={order.wedding_date}
          />
        ))}
        <div className="text-center">
          <button
            onClick={handleReset}
            className="text-sm text-muted-foreground hover:underline"
          >
            Spor en anden ordre
          </button>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Spor din ordre</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {step === "input"
            ? "Indtast din email og telefonnummer for at se status på din bestilling."
            : "Vi har sendt en bekræftelseskode til din email."}
        </p>
      </CardHeader>
      <CardContent>
        {step === "input" ? (
          <form onSubmit={handleSubmitEmail} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
              }}
            />
            <Input
              type="tel"
              placeholder="Telefonnummer"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setError(null)
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sender..." : "Send bekræftelseskode"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-cifret kode"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                setCode(val)
                setError(null)
              }}
              autoFocus
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "Bekræfter..." : "Bekræft kode"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={cooldown > 0}
                className="text-sm text-muted-foreground hover:underline disabled:opacity-50 disabled:no-underline"
              >
                {cooldown > 0 ? `Send ny kode (${cooldown}s)` : "Send ny kode"}
              </button>
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:underline"
              >
                Tilbage
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
