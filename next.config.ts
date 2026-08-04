import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@takumi-rs/core']
}

export default nextConfig
