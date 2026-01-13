const path = require('path');

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Enable React Strict Mode for development warnings.
  reactStrictMode: true,

  // Output as a standalone build (useful for Docker containers).
  output: 'standalone',

  // Base directory for the project (defaults to the repository root).
  distDir: '.next',

  // Configure image optimization (optional – adjust domains as needed).
  images: {
    domains: [], // Add external image domains here if you use remote images.
  },

  // Custom Webpack configuration.
  webpack(config, { isServer }) {
    // -----------------------------------------------------------------
    // Path alias: '@/src/*' → '<project_root>/src/*'
    // Mirrors the alias defined in tsconfig.json.
    // -----------------------------------------------------------------
    config.resolve.alias['@/src'] = path.resolve(__dirname, 'src');

    // -----------------------------------------------------------------
    // Ensure that SVG imports work as React components.
    // Allows: import Icon from '@/assets/icon.svg';
    // -----------------------------------------------------------------
    config.module.rules.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    // -----------------------------------------------------------------
    // Reduce bundle size by ignoring moment locales (if moment is used).
    // Uncomment if you have moment as a dependency.
    // -----------------------------------------------------------------
    // if (!isServer) {
    //   config.plugins.push(
    //     new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ })
    //   );
    // }

    return config;
  },

  // -----------------------------------------------------------------
  // Internationalisation (i18n) settings – adjust locales as needed.
  // -----------------------------------------------------------------
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },

  // -----------------------------------------------------------------
  // Experimental features – enable if you need them.
  // -----------------------------------------------------------------
  experimental: {
    // Enable server actions, if you plan to use them.
    // serverActions: true,
  },
};

module.exports = nextConfig;