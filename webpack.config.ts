import path from "node:path";
import CopyWebpackPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import type { Configuration } from "webpack";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";

const sourcePath = path.resolve(__dirname, "src");

const resolveConfiguration: Pick<Configuration, "resolve"> = {
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: { "@": sourcePath },
  },
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
        ? "static/js/[name].[contenthash:8].js"
        : "static/js/[name].js",
      assetModuleFilename: "static/media/[name].[contenthash:8][ext]",
      clean: true,
      publicPath: "/",
    },
    module: {
      rules: [
        { test: /\.[jt]sx?$/, exclude: /node_modules/, use: "babel-loader" },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
        {
          test: /\.(woff2?|ttf|otf)$/i,
          type: "asset/resource",
          generator: { filename: "static/fonts/[name].[contenthash:8][ext]" },
        },
        { test: /\.(png|jpe?g|webp|avif|svg)$/i, type: "asset/resource" },
      ],
    },
    ...resolveConfiguration,
    ...optimizationConfiguration,
    optimization: {
      ...optimizationConfiguration.optimization,
      minimizer: ["...", new CssMinimizerPlugin()],
    },
    ...developmentServerConfiguration,
    devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
    cache: { type: "filesystem" },
    plugins: [
      new HtmlWebpackPlugin({ template: "public/index.html" }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "public",
            to: ".",
            globOptions: { ignore: ["**/index.html"] },
            noErrorOnMissing: true,
          },
        ],
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: "static/css/[name].[contenthash:8].css",
            }),
          ]
        : []),
    ],
  };
};

export default webpackConfig;
