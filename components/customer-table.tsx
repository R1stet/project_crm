"use client"

import type React from "react"

import { useState } from "react"
import { ChevronUp, ChevronDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/types/customer"

interface CustomerTableProps {
  customers: Customer[]
  onViewCustomer: (customer: Customer) => void
  onSort: (field: keyof Customer) => void
  sortField: keyof Customer
  sortDirection: "asc" | "desc"
  filters: Record<string, string>
  onFilterChange: (filters: Record<string, string>) => void
}

export function CustomerTable({
  customers,
  onViewCustomer,
  onSort,
  sortField,
  sortDirection,
  filters,
  onFilterChange,
}: CustomerTableProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (field: string, value: string) => {
    onFilterChange({ ...filters, [field]: value })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "kjole afhentet":
        return "default"
      case "i produktion":
        return "secondary"
      case "kjole ankommet":
        return "secondary"
      case "afventer":
        return "outline"
      default:
        return "outline"
    }
  }

  const SortableHeader = ({ field, children }: { field: keyof Customer; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none" onClick={() => onSort(field)}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field &&
          (sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />)}
      </div>
    </TableHead>
  )

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Kunder ({customers.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filtre
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Sælger</label>
              <Input
                placeholder="Filtrer efter sælger"
                value={filters.salesperson || ""}
                onChange={(e) => handleFilterChange("salesperson", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Input
                placeholder="Filtrer efter status"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">brudekjole</label>
              <Input
                placeholder="Filtrer efter kjole"
                value={filters.dress || ""}
                onChange={(e) => handleFilterChange("dress", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Leverandør</label>
              <Input
                placeholder="Filtrer efter producent"
                value={filters.maker || ""}
                onChange={(e) => handleFilterChange("maker", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Skrædder</label>
              <Input
                placeholder="Filtrer efter skrædder"
                value={filters.skrædder || ""}
                onChange={(e) => handleFilterChange("skrædder", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader field="name">Navn</SortableHeader>
              <SortableHeader field="weddingDate">Bryllupsdato</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="phoneNumber">Telefon</SortableHeader>
              <SortableHeader field="salesperson">Sælger</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="dress">brudekjole</SortableHeader>
              <SortableHeader field="maker">Leverandør</SortableHeader>
              <SortableHeader field="skrædder">Skrædder</SortableHeader>
              <TableHead>Størrelse</TableHead>
              <SortableHeader field="invoiceStatus">Faktura</SortableHeader>
              <TableHead>Dokumenter</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onViewCustomer(customer)}
              >
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell className="font-medium text-blue-600">{customer.weddingDate}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="hidden sm:table-cell">{customer.phoneNumber}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.salesperson}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(customer.status)}>{customer.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{customer.dress}</TableCell>
                <TableCell className="hidden lg:table-cell">{customer.maker}</TableCell>
                <TableCell className="hidden lg:table-cell">{customer.skrædder}</TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-xs space-y-1">
                    <div>B: {customer.size.bryst}cm</div>
                    <div>T: {customer.size.talje}cm</div>
                    <div>H: {customer.size.hofte}cm</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.invoiceStatus === "Betalt" ? "default" : "secondary"}>
                    {customer.invoiceStatus}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex space-x-1">
                    {customer.invoiceFileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          customer.invoiceFileUrl && window.open(customer.invoiceFileUrl, "_blank")
                        }}
                        title="Vis Faktura PDF"
                      >
                        📄
                      </Button>
                    )}
                    {customer.supplierFileUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          customer.supplierFileUrl && window.open(customer.supplierFileUrl, "_blank")
                        }}
                        title="Vis Leverandør PDF"
                      >
                        📦
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-8 text-gray-500">Ingen kunder fundet. Prøv at justere din søgning eller filtre.</div>
      )}
    </div>
  )
}