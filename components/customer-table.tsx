"use client"

import type React from "react"

import { useState } from "react"
import { ChevronUp, ChevronDown, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Customer, Status } from "@/types/customer"

// Status options for the filter dropdown
const statusOptions: Status[] = [
  'Afventer',
  'I produktion',
  'Kjole ankommet',
  'Kjole afhentet',
]

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
      case "Afventer":
        return "outline"
      default:
        return "outline"
    }
  }

  const SortableHeader = ({ field, children }: { field: keyof Customer; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer select-none text-center" onClick={() => onSort(field)}>
      <div className="flex items-center justify-center space-x-1">
        <span className="font-bold">{children}</span>
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
        <div className="flex gap-2">
          {Object.values(filters).some(value => value) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onFilterChange({})}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Ryd filtre
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filtre
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b">
          {Object.values(filters).some(value => value) && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium mb-2">Aktive filtre:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).filter(([, value]) => value).map(([field, value]) => {
                  const displayValue = field === "weddingMonth" ? 
                    ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"][parseInt(value) - 1] :
                    value
                  const fieldName = field === "weddingMonth" ? "Bryllupsmåned" :
                                   field === "status" ? "Status" :
                                   field === "dress" ? "Brudekjoler" :
                                   field === "maker" ? "Leverandør" :
                                   field === "skrædder" ? "Skrædder" :
                                   field === "salesperson" ? "Sælger" : field
                  return (
                    <span key={field} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {fieldName}: {displayValue}
                      <button
                        onClick={() => handleFilterChange(field, "")}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Bryllupsmåned</label>
              <select
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.weddingMonth || ""}
                onChange={(e) => handleFilterChange("weddingMonth", e.target.value)}
              >
                <option value="">Alle måneder</option>
                <option value="01">Januar</option>
                <option value="02">Februar</option>
                <option value="03">Marts</option>
                <option value="04">April</option>
                <option value="05">Maj</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">August</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <select
                className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Brudekjoler</label>
              <Input
                placeholder="Filtrer efter kjole"
                value={filters.dress || ""}
                onChange={(e) => handleFilterChange("dress", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Leverandør</label>
              <Input
                placeholder="Filtrer efter leverandør"
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
            <div>
              <label className="text-sm font-medium mb-1 block">Sælger</label>
              <Input
                placeholder="Filtrer efter sælger"
                value={filters.salesperson || ""}
                onChange={(e) => handleFilterChange("salesperson", e.target.value)}
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
              <SortableHeader field="dress">Brudekjoler</SortableHeader>
              <SortableHeader field="maker">Leverandør</SortableHeader>
              <SortableHeader field="skrædder">Skrædder</SortableHeader>
              <SortableHeader field="invoiceStatus">Faktura</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow 
                key={customer.id} 
                className="hover:bg-gray-50 cursor-pointer h-16"
                onClick={() => onViewCustomer(customer)}
              >
                <TableCell className="font-medium py-4">{customer.name}</TableCell>
                <TableCell className="font-medium text-blue-600 py-4">{customer.weddingDate}</TableCell>
                <TableCell className="py-4">{customer.email}</TableCell>
                <TableCell className="hidden sm:table-cell py-4">{customer.phoneNumber}</TableCell>
                <TableCell className="hidden md:table-cell py-4">{customer.salesperson}</TableCell>
                <TableCell className="py-4">
                  <Badge variant={getStatusBadgeVariant(customer.status)}>{customer.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell py-4">{customer.dress}</TableCell>
                <TableCell className="hidden lg:table-cell py-4">{customer.maker}</TableCell>
                <TableCell className="hidden lg:table-cell py-4">{customer.skrædder}</TableCell>
                <TableCell className="py-4">
                  <Badge variant={customer.invoiceStatus === "Betalt" ? "default" : "secondary"}>
                    {customer.invoiceStatus}
                  </Badge>
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