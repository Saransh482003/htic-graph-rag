const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8000/:path*", // your FastAPI backend
      },
    ];
  },
};

export default nextConfig;
