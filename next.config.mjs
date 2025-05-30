/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent server-only files from being bundled in client code
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/auth-server': false,
        'better-auth': false,
        'pg': false,
        'stripe': false,
      };
    }
    return config;
  },
};

export default nextConfig; 