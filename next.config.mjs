/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  serverExternalPackages: ["@napi-rs/canvas", "pdf-parse"]
};

export default nextConfig;
