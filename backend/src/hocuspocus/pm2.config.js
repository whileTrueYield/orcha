module.exports = {
  apps: [
    {
      name: "hocuspocus",
      script: "dist/hocuspocus/server.js",
      // NEVER set more than 1 instance unless you know what you are doing
      instances: "1",
      exec_mode: "fork",
    },
  ],
};
