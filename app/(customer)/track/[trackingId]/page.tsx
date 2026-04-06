import type { Metadata } from "next"
import Link from "next/link"
import { createAnonServerSupabaseClient } from "@/lib/supabase-server"
import { OrderStatusCard } from "@/components/tracking/order-status-card"

export const metadata: Metadata = {
  title: "Spor din ordre | Fuhrmanns",
  description: "Følg status på din brudekjolebestilling",
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ trackingId: string }>
}) {
  const { trackingId } = await params

  if (!UUID_REGEX.test(trackingId)) {
    return <NotFound />
  }

  const supabase = createAnonServerSupabaseClient()

  const { data, error } = await supabase
    .from("customers")
    .select("name, status, dress, expected_delivery_date, wedding_date")
    .eq("tracking_id", trackingId)
    .single()

  if (error || !data) {
    return <NotFound />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <OrderStatusCard
        name={data.name}
        status={data.status}
        dress={data.dress}
        expectedDeliveryDate={data.expected_delivery_date}
        weddingDate={data.wedding_date}
      />
      <Link
        href="/track"
        className="mt-6 text-sm text-muted-foreground hover:underline"
      >
        Spor en anden ordre
      </Link>
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-xl font-semibold mb-2">Ordre ikke fundet</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Vi kunne ikke finde din ordre. Kontroller venligst dit sporings-ID.
      </p>
      <Link
        href="/track"
        className="text-sm text-primary hover:underline"
      >
        Prøv igen
      </Link>
    </div>
  )
}
