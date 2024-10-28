/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@synqly/connect-react-sdk'],
  experimental: {
    instrumentationHook: true,
  },
}

export default nextConfig
