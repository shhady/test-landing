/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  experimental: {
    serverActions: true
  },
  api: {
    bodyParser: {
      sizeLimit: '25mb' // Increased to safely handle multiple large files
    },
    responseLimit: false
  }
}

module.exports = nextConfig 