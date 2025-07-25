"use client"

import { useState, useMemo, useEffect } from "react"
import { Header } from "@/components/header"
import { CustomerTable } from "@/components/customer-table"
import { CustomerModal } from "@/components/customer-modal"
import { CustomerDetailsModal } from "@/components/customer-details-modal"
import { useCustomers } from "@/hooks/use-customers"
import type { Customer } from "@/types/customer"
import { Loader2 } from "lucide-react"

interface DashboardProps {
  currentUser: string
  onLogout: () => void
}

export function Dashboard({ currentUser, onLogout }: DashboardProps) {
  const {
    customers: allCustomers,
    loading,
    searching,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    refetch,
  } = useCustomers()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof Customer>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchCustomers(searchQuery)
      } else {
        refetch()
      }
    }, 500) // Increased to 500ms to let client-side filtering work first

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...allCustomers]

    // Apply search query as client-side filter (for immediate feedback)
    if (searchQuery.trim() && !searching) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((customer) =>
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.maker && customer.maker.toLowerCase().includes(query)) ||
        (customer.notes && customer.notes.toLowerCase().includes(query))
      )
    }

    // Apply column filters
    for (const [field, value] of Object.entries(filters)) {
      if (value) {
        filtered = filtered.filter((customer) => {
          // Special handling for wedding month filter
          if (field === "weddingMonth") {
            if (!customer.weddingDate) return false
            const weddingDate = new Date(customer.weddingDate)
            const month = (weddingDate.getMonth() + 1).toString().padStart(2, '0')
            return month === value
          }
          
          // Special handling for status filter (exact match)
          if (field === "status") {
            return customer.status === value
          }
          
          // Handle other string-based filters (partial match)
          const customerValue = customer[field as keyof Customer]
          if (typeof customerValue === "string") {
            return customerValue.toLowerCase().includes(value.toLowerCase())
          }
          return false
        })
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]

      // Handle nested size object
      if (sortField === "size") {
        aValue = JSON.stringify(a.size)
        bValue = JSON.stringify(b.size)
      }

      const aStr = aValue?.toString() || ""
      const bStr = bValue?.toString() || ""

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })

    return filtered
  }, [allCustomers, sortField, sortDirection, filters, searchQuery, searching])

  const handleAddCustomer = () => {
    setEditingCustomer(null)
    setIsModalOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer)
    setIsModalOpen(true)
    setIsDetailsModalOpen(false) // Close details modal when opening edit modal
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDetailsModalOpen(true)
  }

  const handleSaveCustomer = async (
    customerData: Omit<Customer, "id" | "createdBy" | "createdAt" | "updatedAt" | "dateAdded">,
  ) => {
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, customerData)
      } else {
        await addCustomer({
          ...customerData,
          createdBy: currentUser,
        })
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error("Failed to save customer:", err)
      console.error("Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        customerData: customerData,
      })
      // Show more detailed error information
      const errorMessage = err instanceof Error ? err.message : String(err)
      const errorDetails = err instanceof Error && err.stack ? err.stack : 'No stack trace'
      alert(`Failed to save customer:\n\nError: ${errorMessage}\n\nDetails: ${errorDetails}`)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      await deleteCustomer(id)
    } catch (err) {
      console.error("Failed to delete customer:", err)
      // You could add a toast notification here
    }
  }

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading customers...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentUser={currentUser}
        onLogout={onLogout}
        onAddCustomer={handleAddCustomer}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searching={searching}
      />

      <main className="max-w-[1800px] mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className={`bg-white rounded-lg shadow transition-opacity duration-200 ${searching ? 'opacity-75' : 'opacity-100'}`}>
          <CustomerTable
            customers={filteredAndSortedCustomers}
            onViewCustomer={handleViewCustomer}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>
      </main>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCustomer}
        customer={editingCustomer}
      />

      <CustomerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        customer={selectedCustomer}
        onEdit={handleEditCustomer}
        onDelete={handleDeleteCustomer}
      />
    </div>
  )
}