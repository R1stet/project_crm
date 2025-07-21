"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Customer } from "@/types/customer"
import { dbRowToCustomer, customerToDbRow } from "@/types/customer"

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all customers
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

      if (error) throw error

      const formattedCustomers = data.map(dbRowToCustomer)
      setCustomers(formattedCustomers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Add a new customer
  const addCustomer = async (customerData: Omit<Customer, "id" | "createdAt" | "updatedAt" | "dateAdded">) => {
    try {
      const dbData = customerToDbRow(customerData)
      const { data, error } = await supabase.from("customers").insert([dbData]).select().single()

      if (error) throw error

      const newCustomer = dbRowToCustomer(data)
      setCustomers((prev) => [newCustomer, ...prev])
      return newCustomer
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add customer")
      throw err
    }
  }

  // Update an existing customer
  const updateCustomer = async (
    id: string,
    customerData: Omit<Customer, "id" | "createdAt" | "updatedAt" | "dateAdded" | "createdBy">,
  ) => {
    try {
      const dbData = customerToDbRow({
        ...customerData,
        createdBy: "", // This won't be updated
      })

      const { data, error } = await supabase
        .from("customers")
        .update({
          ...dbData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      const updatedCustomer = dbRowToCustomer(data)
      setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)))
      return updatedCustomer
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer")
      throw err
    }
  }

  // Delete a customer
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id)

      if (error) throw error

      setCustomers((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer")
      throw err
    }
  }

  // Search customers
  const searchCustomers = async (query: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .or(
          `name.ilike.%${query}%,email.ilike.%${query}%,dress.ilike.%${query}%,maker.ilike.%${query}%,notes.ilike.%${query}%`,
        )
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedCustomers = data.map(dbRowToCustomer)
      setCustomers(formattedCustomers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    refetch: fetchCustomers,
  }
}