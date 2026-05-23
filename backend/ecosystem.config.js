module.exports = {
  apps: [
    {
      name: "orcha",
      cwd: "./orcha-backend",
      script: "./dist/server.js",
      watch: false,
      min_uptime: 5000,
      env: {
        PORT: 4000,
        NODE_ENV: "production",
        ORCHA_HOSTNAME: "api.dev-orcha.com",
        ORCHA_ALLOW_ORIGIN: "https://app.dev-orcha.com",
        ORCHA_SESSION_SECRET: "your-secret-key-goes-here",
        TYPEORM_CONNECTION: "postgres",
        TYPEORM_SYNCHRONIZE: false,
        TYPEORM_URL: "postgres://tests@postgres-service/tests",
      },
    },
  ],
};
