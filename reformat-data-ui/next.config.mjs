const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  basePath: isProd ? '/data-reformat-tool' : '',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'export',
}

export default nextConfig
