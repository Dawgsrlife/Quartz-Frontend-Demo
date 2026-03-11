/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: {
    unoptimized: true,
  },
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
};

module.exports = nextConfig;
