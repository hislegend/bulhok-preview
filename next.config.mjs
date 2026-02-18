/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/bulhok-preview',
  assetPrefix: '/bulhok-preview',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
