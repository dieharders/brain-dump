/** @type {import('next').NextConfig} */
module.exports = {
  // if strict mode is true then initial page is loaded twice (only in dev)
  reactStrictMode: false,
  experimental: {
    serverActions: true,
  },
}
