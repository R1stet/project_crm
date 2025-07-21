"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Customer } from "@/types/customer"

interface CustomerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (customer: Omit<Customer, "id" | "createdBy" | "createdAt" | "updatedAt" | "dateAdded">) => Promise<void>
  customer?: Customer | null
}

export function CustomerModal({ isOpen, onClose, onSave, customer }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    salesperson: "",
    status: "Awaiting",
    dress: "",
    maker: "",
    size: {
      bryst: "",
      talje: "",
      hofte: "",
      arms: "",
      height: "",
    },
    invoiceStatus: "To be sent",
    invoicePdf: "",
    confirmationPdf: "",
    notes: "",
    weddingDate: "",
  })

  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber || "",
        salesperson: customer.salesperson || "",
        status: customer.status,
        dress: customer.dress || "",
        maker: customer.maker || "",
        size: {
          bryst: customer.size.bryst || "",
          talje: customer.size.talje || "",
          hofte: customer.size.hofte || "",
          arms: customer.size.arms || "",
          height: customer.size.height || "",
        },
        invoiceStatus: customer.invoiceStatus,
        invoicePdf: customer.invoicePdf || "",
        confirmationPdf: customer.confirmationPdf || "",
        notes: customer.notes || "",
        weddingDate: customer.weddingDate || "",
      })
    } else {
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        salesperson: "",
        status: "Awaiting",
        dress: "",
        maker: "",
        size: {
          bryst: "",
          talje: "",
          hofte: "",
          arms: "",
          height: "",
        },
        invoiceStatus: "To be sent",
        invoicePdf: "",
        confirmationPdf: "",
        notes: "",
        weddingDate: "",
      })
    }
  }, [customer, isOpen])

  const handleChange = (field: string, value: string) => {
    if (field.startsWith("size.")) {
      const sizeField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        size: {
          ...prev.size,
          [sizeField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave({
        ...formData,
        phoneNumber: formData.phoneNumber || null,
        salesperson: formData.salesperson || null,
        dress: formData.dress || null,
        maker: formData.maker || null,
        size: {
          bryst: formData.size.bryst || null,
          talje: formData.size.talje || null,
          hofte: formData.size.hofte || null,
          arms: formData.size.arms || null,
          height: formData.size.height || null,
        },
        invoicePdf: formData.invoicePdf || null,
        confirmationPdf: formData.confirmationPdf || null,
        notes: formData.notes || null,
        weddingDate: formData.weddingDate || null,
      })
    } catch (error) {
      console.error("Error saving customer:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
          <DialogDescription>
            {customer ? "Update customer information below." : "Enter customer details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salesperson">Salesperson</Label>
              <Input
                id="salesperson"
                value={formData.salesperson}
                onChange={(e) => handleChange("salesperson", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Awaiting">Awaiting</SelectItem>
                  <SelectItem value="Awaiting fitting">Awaiting fitting</SelectItem>
                  <SelectItem value="In production">In production</SelectItem>
                  <SelectItem value="Ready for pickup">Ready for pickup</SelectItem>
                  <SelectItem value="Finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dress">Dress</Label>
              <Input id="dress" value={formData.dress} onChange={(e) => handleChange("dress", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maker">Maker</Label>
              <Input id="maker" value={formData.maker} onChange={(e) => handleChange("maker", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Size Measurements (cm)</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div>
                <Label htmlFor="bryst" className="text-xs">
                  Bryst
                </Label>
                <Input
                  id="bryst"
                  placeholder="cm"
                  value={formData.size.bryst}
                  onChange={(e) => handleChange("size.bryst", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="talje" className="text-xs">
                  Talje
                </Label>
                <Input
                  id="talje"
                  placeholder="cm"
                  value={formData.size.talje}
                  onChange={(e) => handleChange("size.talje", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="hofte" className="text-xs">
                  Hofte
                </Label>
                <Input
                  id="hofte"
                  placeholder="cm"
                  value={formData.size.hofte}
                  onChange={(e) => handleChange("size.hofte", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="arms" className="text-xs">
                  Arms
                </Label>
                <Input
                  id="arms"
                  placeholder="cm"
                  value={formData.size.arms}
                  onChange={(e) => handleChange("size.arms", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs">
                  Height
                </Label>
                <Input
                  id="height"
                  placeholder="cm"
                  value={formData.size.height}
                  onChange={(e) => handleChange("size.height", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceStatus">Invoice Status</Label>
              <Select value={formData.invoiceStatus} onValueChange={(value) => handleChange("invoiceStatus", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To be sent">To be sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weddingDate">Wedding Date</Label>
              <Input
                id="weddingDate"
                type="date"
                value={formData.weddingDate}
                onChange={(e) => handleChange("weddingDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoicePdf">Invoice PDF URL</Label>
              <Input
                id="invoicePdf"
                placeholder="https://example.com/invoice.pdf"
                value={formData.invoicePdf}
                onChange={(e) => handleChange("invoicePdf", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmationPdf">Confirmation PDF URL</Label>
              <Input
                id="confirmationPdf"
                placeholder="https://example.com/confirmation.pdf"
                value={formData.confirmationPdf}
                onChange={(e) => handleChange("confirmationPdf", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
