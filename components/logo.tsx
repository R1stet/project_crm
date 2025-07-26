"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

interface LogoProps {
  className?: string
}

export function Logo({ className = "h-8" }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogo() {
      try {
        // List files in the logo bucket
        const { data: files, error: listError } = await supabase.storage
          .from('logo')
          .list()

        if (listError) {
          console.error('Error listing logo files:', listError)
          setLoading(false)
          return
        }

        if (files && files.length > 0) {
          // Get the first file (assuming there's only one logo)
          const logoFile = files[0]
          
          // Get the public URL for the logo
          const { data } = supabase.storage
            .from('logo')
            .getPublicUrl(logoFile.name)

          setLogoUrl(data.publicUrl)
        }
      } catch (error) {
        console.error('Error fetching logo:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  if (loading) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse rounded`} />
    )
  }

  if (!logoUrl) {
    // Fallback to text if logo can't be loaded
    return (
      <h1 className="text-xl font-bold text-gray-900">Brudekjole CRM</h1>
    )
  }

  return (
    <Image 
      src={logoUrl} 
      alt="Company Logo" 
      width={120}
      height={32}
      className={`${className} object-contain`}
    />
  )
}