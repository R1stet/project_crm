"use client"

import type React from "react"

import { useState } from "react"
import { ChevronUp, ChevronDown, Edit, Trash2, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/types/customer"

interface CustomerTableProps {
  customers: Customer[]
  onEditCustomer: (customer: Customer) => void
  onDeleteCustomer: (id: string) => void
  onSort: (field: keyof Customer) => void
  sortField: keyof Customer
  sortDirection: "asc" | "desc"
  filters: Record<string, string>
  onFilterChange: (filters: Record<string, string>) => void
}

export function CustomerTable({
  customers,
  onEditCustomer,
  onDeleteCustomer,
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
      case "finished":
        return "default"
      case "in production":
        return "secondary"
      case "awaiting fitting":
        return "outline"
      case "awaiting":
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
        <h2 className="text-lg font-semibold">Customers ({customers.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Salesperson</label>
              <Input
                placeholder="Filter by salesperson"
                value={filters.salesperson || ""}
                onChange={(e) => handleFilterChange("salesperson", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Input
                placeholder="Filter by status"
                value={filters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Dress</label>
              <Input
                placeholder="Filter by dress"
                value={filters.dress || ""}
                onChange={(e) => handleFilterChange("dress", e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Maker</label>
              <Input
                placeholder="Filter by maker"
                value={filters.maker || ""}
                onChange={(e) => handleFilterChange("maker", e.target.value)}
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
              <SortableHeader field="name">Name</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="phoneNumber">Phone</SortableHeader>
              <SortableHeader field="salesperson">Salesperson</SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="dress">Dress</SortableHeader>
              <SortableHeader field="maker">Maker</SortableHeader>
              <TableHead>Size</TableHead>
              <SortableHeader field="invoiceStatus">Invoice</SortableHeader>
              <TableHead>Documents</TableHead>
              <SortableHeader field="weddingDate">Wedding Date</SortableHeader>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="hidden sm:table-cell">{customer.phoneNumber}</TableCell>
                <TableCell className="hidden md:table-cell">{customer.salesperson}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(customer.status)}>{customer.status}</Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{customer.dress}</TableCell>
                <TableCell className="hidden lg:table-cell">{customer.maker}</TableCell>
                <TableCell className="hidden xl:table-cell">
                  <div className="text-xs space-y-1">
                    <div>B: {customer.size.bryst}cm</div>
                    <div>T: {customer.size.talje}cm</div>
                    <div>H: {customer.size.hofte}cm</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={customer.invoiceStatus === "Paid" ? "default" : "secondary"}>
                    {customer.invoiceStatus}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex space-x-1">
                    {customer.invoicePdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => customer.invoicePdf && window.open(customer.invoicePdf, "_blank")}
                      >
                        📄
                      </Button>
                    )}
                    {customer.confirmationPdf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => customer.confirmationPdf && window.open(customer.confirmationPdf, "_blank")}
                      >
                        ✅
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{customer.weddingDate}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onDeleteCustomer(customer.id)} className="text-red-600">
                          Delete Customer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-8 text-gray-500">No customers found. Try adjusting your search or filters.</div>
      )}
    </div>
  )
}