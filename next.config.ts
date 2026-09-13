import type { NextConfig } from 'next';

const githubPagesBuild = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: githubPagesBuild ? 'export' : undefined,
  trailingSlash: false,
};

export default nextConfig;
