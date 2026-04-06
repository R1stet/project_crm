import { supabase } from './supabase'

/**
 * File Storage Security Notes:
 *
 * IMPORTANT: This file contains CLIENT-SIDE file validation only.
 * For production security, you MUST also configure server-side validation:
 *
 * 1. Supabase Storage Bucket Configuration:
 *    - Set file size limits in Supabase Dashboard > Storage > Bucket Settings
 *    - Recommended: 10MB max file size
 *    - Configure allowed MIME types: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
 *
 * 2. Row Level Security (RLS) Policies:
 *    - Enable RLS on storage buckets
 *    - Only allow authenticated users to upload
 *    - Restrict file access based on user permissions
 *
 * 3. Additional Recommendations:
 *    - Implement virus scanning for uploaded files (e.g., ClamAV, VirusTotal API)
 *    - Use signed URLs with expiration for file access
 *    - Monitor storage usage to prevent abuse
 *    - Implement rate limiting on uploads
 */

// Utility function to convert data URL to File
export function dataURLtoFile(dataURL: string, filename: string): File {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

// Function to capture image from camera (mobile-friendly)
export function captureImageFromCamera(): Promise<File | null> {
  return new Promise((resolve) => {
    // Create file input with camera capture
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use back camera on mobile
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0]
      resolve(file || null)
    }
    
    input.oncancel = () => resolve(null)
    
    // Trigger file selector
    input.click()
  })
}

export async function uploadInvoice(file: File, customerId?: string): Promise<string> {
  if (!supabase) {
    throw new Error('Database connection not available')
  }

  try {
    // Validate file type (PDF or common image formats)
    const validTypes = ['pdf', 'jpg', 'jpeg', 'png', 'webp']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !validTypes.includes(fileExt)) {
      throw new Error('Invalid file type. Please upload PDF, JPG, PNG, or WebP files.')
    }

    // Generate a unique filename
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

    return data.path
  } catch (error) {
    console.error('Error uploading file:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to upload file')
  }
}

export async function deleteInvoice(fileName: string): Promise<void> {
  if (!supabase) {
    throw new Error('Database connection not available')
  }

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

export async function uploadSupplierFile(file: File, customerId?: string): Promise<string> {
  if (!supabase) {
    throw new Error('Database connection not available')
  }

  try {
    // Validate file type (PDF or common image formats)
    const validTypes = ['pdf', 'jpg', 'jpeg', 'png', 'webp']
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !validTypes.includes(fileExt)) {
      throw new Error('Invalid file type. Please upload PDF, JPG, PNG, or WebP files.')
    }

    // Generate a unique filename
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

    return data.path
  } catch (error) {
    console.error('Error uploading supplier file:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to upload supplier file')
  }
}

const OBJECT_PATH_PATTERN = /^[a-zA-Z0-9_-]+\.(pdf|jpg|jpeg|png|webp)$/

export function isInternalObjectPath(value: string): boolean {
  return OBJECT_PATH_PATTERN.test(value)
}

export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  if (!supabase) {
    throw new Error('Database connection not available')
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch('/api/storage/signed-url', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ bucket, path }),
  })

  if (!response.ok) {
    throw new Error('Failed to get signed URL')
  }

  const data = await response.json()
  return data.url
}

export async function deleteSupplierPDF(fileName: string): Promise<void> {
  if (!supabase) {
    throw new Error('Database connection not available')
  }

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