const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./lib/orcha-support.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: "tsconfig.lib.json",
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  mode: "production",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new Dotenv({
      path: "./.env.development",
      systemvars: true,
    }),
  ],
  output: {
    filename: "orcha-support.js",
    path: path.resolve(__dirname, "./public"),
  },
};
