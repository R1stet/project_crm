"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Customer } from "@/types/customer"

interface CustomerDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  customer: Customer | null
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
}

export function CustomerDetailsModal({
  isOpen,
  onClose,
  customer,
  onEdit,
  onDelete,
}: CustomerDetailsModalProps) {
  if (!customer) return null

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "kjole afhentet":
        return "default"
      case "i produktion":
        return "secondary"
      case "kjole ankommet":
        return "secondary"
      case "afventer":
      case "Afventer":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Ikke angivet"
    try {
      return new Date(dateString).toLocaleDateString("da-DK")
    } catch {
      return dateString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{customer.name}</DialogTitle>
              <DialogDescription>Kundedetaljer</DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(customer)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Rediger
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => onDelete(customer.id)}
                    className="text-red-600"
                  >
                    Slet Kunde
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Kontaktoplysninger</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Bryllupsdato</label>
                <p className="text-sm font-semibold text-blue-600">{formatDate(customer.weddingDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-sm">{customer.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Telefon</label>
                <p className="text-sm">{customer.phoneNumber || "Ikke angivet"}</p>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Ordreoplysninger</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Sælger</label>
                <p className="text-sm">{customer.salesperson || "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(customer.status)}>
                    {customer.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Brudekjoler</label>
                <p className="text-sm">{customer.dress || "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Leverandør</label>
                <p className="text-sm">{customer.maker || "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Skrædder</label>
                <p className="text-sm">{customer.skrædder || "Ikke angivet"}</p>
              </div>
            </div>
          </div>

          {/* Size Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Størrelsesmål</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Bryst</label>
                <p className="text-sm">{customer.size.bryst ? `${customer.size.bryst}cm` : "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Talje</label>
                <p className="text-sm">{customer.size.talje ? `${customer.size.talje}cm` : "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Hofte</label>
                <p className="text-sm">{customer.size.hofte ? `${customer.size.hofte}cm` : "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Arme</label>
                <p className="text-sm">{customer.size.arms ? `${customer.size.arms}cm` : "Ikke angivet"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Højde</label>
                <p className="text-sm">{customer.size.height ? `${customer.size.height}cm` : "Ikke angivet"}</p>
              </div>
            </div>
          </div>

          {/* Accessories */}
          {customer.accessories && customer.accessories.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Accessories</h3>
              <div className="space-y-3">
                {customer.accessories.map((accessory) => (
                  <div key={accessory.id} className="bg-white p-3 rounded-md border">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-medium text-sm">{accessory.type}</span>
                        {accessory.note && (
                          <p className="text-sm text-gray-600 mt-1">{accessory.note}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoice and Documents */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Faktura og Dokumenter</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fakturastatus</label>
                <div className="mt-1">
                  <Badge variant={customer.invoiceStatus === "Betalt" ? "default" : "secondary"}>
                    {customer.invoiceStatus}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Document Links */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-600 block mb-2">Dokumenter</label>
              <div className="flex space-x-2">
                {customer.invoiceFileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(customer.invoiceFileUrl!, "_blank")}
                  >
                    📄 Vis Faktura
                  </Button>
                )}
                {customer.supplierFileUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(customer.supplierFileUrl!, "_blank")}
                  >
                    📦 Vis Leverandør
                  </Button>
                )}
                {!customer.invoiceFileUrl && !customer.supplierFileUrl && (
                  <p className="text-sm text-gray-500">Ingen dokumenter tilgængelige</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Noter</h3>
              <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-sm font-medium text-gray-600">Oprettet af</label>
                <p className="text-sm">{customer.createdBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Oprettet</label>
                <p className="text-sm">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Sidst opdateret</label>
                <p className="text-sm">{formatDate(customer.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}