// /hooks/use-customers.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types/customer';
import { dbRowToCustomer, customerToDbRow } from '@/types/customer';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- fetch ---------- */
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data.map(dbRowToCustomer));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- add ---------- */
  const addCustomer = async (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'dateAdded'>) => {
    try {
      const { data, error } = await supabase.from('customers').insert([customerToDbRow(customerData)]).select().single();

      if (error) throw error;

      const newCustomer = dbRowToCustomer(data);
      setCustomers((prev) => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer');
      throw err;
    }
  };

  /* ---------- update ---------- */
  const updateCustomer = async (
    id: string,
    customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'dateAdded' | 'createdBy'>
  ) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerToDbRow({ ...customerData, createdBy: '' }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCustomer = dbRowToCustomer(data);
      setCustomers((prev) => prev.map((c) => (c.id === id ? updatedCustomer : c)));
      return updatedCustomer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
      throw err;
    }
  };

  /* ---------- delete ---------- */
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      throw err;
    }
  };

  /* ---------- search ---------- */
  const searchCustomers = useCallback(async (query: string) => {
    try {
      setSearching(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(
          `name.ilike.%${query}%,email.ilike.%${query}%,maker.ilike.%${query}%,notes.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data.map(dbRowToCustomer));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }, []);

  /* ---------- init ---------- */
  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    searching,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    refetch: fetchCustomers,
  };
}
