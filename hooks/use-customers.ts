// /hooks/use-customers.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Customer } from '@/types/customer';
import { dbRowToCustomer, customerToDbRow } from '@/types/customer';
import { sanitizeSearchQuery } from '@/lib/validation';
import { sanitizeError } from '@/lib/error-handler';

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
      setError(sanitizeError(err));
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
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
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
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /* ---------- delete ---------- */
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const errorMessage = sanitizeError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /* ---------- search ---------- */
  const searchCustomers = useCallback(async (query: string) => {
    try {
      setSearching(true);
      setError(null);
      
      const sanitizedQuery = sanitizeSearchQuery(query);
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(
          `name.ilike.%${sanitizedQuery}%,email.ilike.%${sanitizedQuery}%,maker.ilike.%${sanitizedQuery}%,notes.ilike.%${sanitizedQuery}%`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data.map(dbRowToCustomer));
    } catch (err) {
      setError(sanitizeError(err));
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
