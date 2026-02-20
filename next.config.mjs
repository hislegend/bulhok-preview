/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  ...(isGitHubPages && {
    output: 'export',
    basePath: '/bulhok-preview',
    assetPrefix: '/bulhok-preview',
  }),
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
