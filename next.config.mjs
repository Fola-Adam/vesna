import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
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
        ],
        minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Compression
    compress: true,

    // Experimental features for performance
    experimental: {
        // Optimize package imports for common libraries
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        // Server actions for progressive enhancement
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

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

    // Webpack optimization
    webpack: (config, { dev, isServer }) => {
        // Exclude native Node.js modules from server bundle
        if (isServer) {
            config.externals = [...(config.externals || []), 'onnxruntime-node', 'sharp']
        }

        // Optimize bundle size in production
        if (!dev && !isServer) {
            config.optimization = {
                ...config.optimization,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'all',
                        },
                        common: {
                            minChunks: 2,
                            chunks: 'all',
                            enforce: true,
                        },
                    },
                },
            }
        }
        return config
    },
}

// PWA configuration
const pwaConfig = {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
        {
            urlPattern: /^https?.*/,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'offlineCache',
                expiration: {
                    maxEntries: 200,
                },
            },
        },
        {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'image-cache',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
            },
        },
        {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
                cacheName: 'font-cache',
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
            },
        },
    ],
}

export default withPWA(pwaConfig)(nextConfig)