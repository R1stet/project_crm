import { supabase } from './supabase'

export async function uploadInvoice(file: File, customerId?: string): Promise<string> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = customerId 
      ? `${customerId}_invoice.${fileExt}` 
      : `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('invoices')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      })

    if (error) throw error

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('invoices')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error('Failed to upload file')
  }
}

export async function deleteInvoice(fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('invoices')
      .remove([fileName])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

export async function uploadSupplierPDF(file: File, customerId?: string): Promise<string> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = customerId 
      ? `${customerId}_supplier.${fileExt}` 
      : `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from('supplier')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true // Replace if exists
      })

    if (error) throw error

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('supplier')
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading supplier file:', error)
    throw new Error('Failed to upload supplier file')
  }
}

export async function deleteSupplierPDF(fileName: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('supplier')
      .remove([fileName])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting supplier file:', error)
    throw new Error('Failed to delete supplier file')
  }
}