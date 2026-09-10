import path from "node:path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const sourcePath = path.resolve(__dirname, "src");
const moduleConfiguration: Pick<Configuration, "module"> = {
  module: {
    rules: [
      { test: /\.[jt]sx?$/, exclude: /node_modules/, use: "babel-loader" },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.(png|jpe?g|webp|avif|svg|woff2?)$/i, type: "asset/resource" },
    ],
  },
};
const resolveConfiguration: Pick<Configuration, "resolve"> = {
  resolve: { extensions: [".tsx", ".ts", ".js"], alias: { "@": sourcePath } },
};
const optimizationConfiguration: Pick<Configuration, "optimization"> = {
  optimization: {
    runtimeChunk: "single",
    splitChunks: { chunks: "all" },
    moduleIds: "deterministic",
  },
};
const developmentServerConfiguration: { devServer: DevServerConfiguration } = {
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    client: { overlay: true },
  },
};
const webpackConfig = (
  _environment: unknown,
  arguments_: { mode?: string },
): Configuration => {
  const isProduction = arguments_.mode === "production";
  return {
    mode: isProduction ? "production" : "development",
    entry: "./src/index.tsx",
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: isProduction
        ? "assets/[name].[contenthash:8].js"
        : "assets/[name].js",
      assetModuleFilename: "assets/[name].[contenthash:8][ext]",
      clean: true,
      publicPath: "/",
    },
    ...moduleConfiguration,
    ...resolveConfiguration,
    ...optimizationConfiguration,
    ...developmentServerConfiguration,
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
    cache: { type: "filesystem" },
    plugins: [new HtmlWebpackPlugin({ template: "public/index.html" })],
  };
};
export default webpackConfig;
