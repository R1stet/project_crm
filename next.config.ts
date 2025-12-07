import type { NextConfig } from "next";

// Extract hostname from Supabase URL for image optimization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHostname = supabaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Only add pattern if Supabase URL is configured
      ...(supabaseHostname ? [{
        protocol: 'https' as const,
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**',
      }] : []),
    ],
  },
};

export default nextConfig;
