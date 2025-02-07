/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb' // Set the API route size limit to 20MB
    },
    responseLimit: false
  }
}

module.exports = nextConfig 