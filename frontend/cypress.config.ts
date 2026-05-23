import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    API_HOST: "http://localhost:4000",
  },
  e2e: {
    video: false,
    experimentalSessionAndOrigin: true,
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
