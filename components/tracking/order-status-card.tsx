import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStatusColor, getCustomerFriendlyStatus, formatDate } from "@/lib/status-utils"

interface OrderStatusCardProps {
  name: string
  status: string
  dress: string | null
  expectedDeliveryDate: string | null
  weddingDate: string | null
}

const STATUS_ORDER = ["afventer", "i produktion", "kjole ankommet", "kjole afhentet"]

function getStepIndex(status: string): number {
  const idx = STATUS_ORDER.indexOf(status.toLowerCase())
  return idx === -1 ? 0 : idx
}

export function OrderStatusCard({
  name,
  status,
  dress,
  expectedDeliveryDate,
  weddingDate,
}: OrderStatusCardProps) {
  const currentStep = getStepIndex(status)
  const stepLabels = ["Ordre modtaget", "I produktion", "Klar til afhentning", "Afhentet"]

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">Ordrestatus</CardTitle>
        <p className="text-sm text-muted-foreground">{name}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status badge */}
        <div className="flex justify-center">
          <Badge className={`text-sm px-4 py-1 ${getStatusColor(status)}`}>
            {getCustomerFriendlyStatus(status)}
          </Badge>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-between px-2">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i < currentStep ? "\u2713" : i + 1}
              </div>
              <span className="text-[10px] sm:text-xs text-center mt-1 text-muted-foreground leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="space-y-3 pt-2">
          {dress && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kjole</span>
              <span className="font-medium">{dress}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Forventet levering</span>
            <span className="font-medium">{formatDate(expectedDeliveryDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Bryllupsdato</span>
            <span className="font-medium">{formatDate(weddingDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
