/** @type {import('next').NextConfig} */
const nextConfig = {
  // App router is now stable in Next.js 13+, no experimental flag needed
  images: {
    domains: ['ui-avatars.com'], // Allow ui-avatars.com for default avatar generation
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
}

module.exports = nextConfig
