import type { NextConfig } from "next";

// Extract hostname from Supabase URL for image optimization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseHostname = supabaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Cutover: this CRM has been merged into the booking app at book.fuhrmanns.dk.
// 301-redirect the two user-facing routes so any bookmarked or in-flight links
// land on the new surface. The catch-all redirect on '/' covers everything
// else (login form, settings, etc.) since the underlying app is being
// decommissioned and there is no useful destination on this domain anymore.
const CRM_NEW_BASE = 'https://book.fuhrmanns.dk';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Only add pattern if Supabase URL is configured
      ...(supabaseHostname ? [
        {
          protocol: 'https' as const,
          hostname: supabaseHostname,
          port: '',
          pathname: '/storage/v1/object/public/**',
        },
        {
          protocol: 'https' as const,
          hostname: supabaseHostname,
          port: '',
          pathname: '/storage/v1/object/sign/**',
        },
      ] : []),
    ],
  },
  async redirects() {
    return [
      // Customer-facing tracking URL → new /track on the booking app.
      { source: '/track', destination: `${CRM_NEW_BASE}/track`, permanent: true },
      // Staff CRM dashboard (route group (crm)) → new /admin/crm.
      { source: '/', destination: `${CRM_NEW_BASE}/admin/crm`, permanent: true },
      // Catch-all for anything else under the old domain.
      { source: '/:path*', destination: `${CRM_NEW_BASE}/admin/crm`, permanent: true },
    ];
  },
};

export default nextConfig;
