/** @type {import('next').NextConfig} */
const nextConfig = {
    // Public deployment URLs are known at build time; Netlify's internal request
    // URL may have a different origin in the server handler. No secrets here.
    env: {
        VESNA_ALLOWED_ORIGINS: [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL].filter(Boolean).join(','),
        // A non-secret build-context flag lets server-side data code make
        // preview-only presentation adjustments without touching the catalog.
        VESNA_NETLIFY_CONTEXT: process.env.CONTEXT ?? '',
        VESNA_DISPATCH_ORIGIN: process.env.DEPLOY_PRIME_URL || process.env.URL || '',
    },
    // Turbopack is the default bundler in Next.js 16 (dev + build).

    // Image optimization
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            // Supabase Storage — product images uploaded from the admin panel
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
            { protocol: 'https', hostname: 'resource.logitech.com' },
            { protocol: 'https', hostname: 'cdn.shopify.com' },
            { protocol: 'https', hostname: 'www.pcrichard.com' },
            { protocol: 'https', hostname: 'd1ncau8tqf99kp.cloudfront.net' },
            { protocol: 'https', hostname: 'media.sonos.com' },
            { protocol: 'https', hostname: 'www.hydroflask.com' },
            { protocol: 'https', hostname: 'www.hatch.co' },
            { protocol: 'https', hostname: 'image.benq.com' },
            { protocol: 'https', hostname: 'fellowproducts.com' },
            { protocol: 'https', hostname: 'ember.com' },
        ],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Compression
    compress: true,

    // Headers for caching and security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                ],
            },
            {
                source: '/unsubscribe',
                headers: [
                    { key: 'Referrer-Policy', value: 'no-referrer' },
                    { key: 'Cache-Control', value: 'private, no-store' },
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
            {
                source: '/dispatch/confirm',
                headers: [
                    { key: 'Referrer-Policy', value: 'no-referrer' },
                    { key: 'Cache-Control', value: 'private, no-store' },
                    { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
                ],
            },
            {
                // Cache static assets
                source: '/:all*(svg|jpg|png|webp|avif|ico|woff|woff2)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Cache fonts
                source: '/fonts/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ]
    },

    // Redirects for SEO
    async redirects() {
        return [
            {
                source: '/collections',
                destination: '/archive',
                permanent: true,
            },
            {
                source: '/atelier',
                destination: '/archive',
                permanent: true,
            },
            {
                source: '/curated',
                destination: '/picks',
                permanent: true,
            },
        ]
    },

    // NOTE: cacheComponents ('use cache') is intentionally NOT enabled globally:
    // it conflicts with route-segment `runtime` exports on our Node API routes
    // (/api/venus loads ONNX embeddings, which cannot run on Edge).
    // Static pages use the standard `export const revalidate` ISR instead.
}

export default nextConfig
