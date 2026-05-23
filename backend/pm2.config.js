module.exports = {
  apps: [
    {
      name: "orcha-api",
      script: "dist/server.js",
      instances: "1",
      exec_mode: "fork",
    },
    {
      name: "orcha-cron",
      script: "dist/cron.js",
      instances: "1",
      exec_mode: "fork",
    },
  ],
};
