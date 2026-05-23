// babel.config.js
module.exports = {
  plugins: [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    "@vjpr/babel-plugin-parameter-decorator",
    "babel-plugin-transform-typescript-metadata",
    "@babel/plugin-proposal-class-properties",
  ],
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    "@babel/preset-typescript",
  ],
};
