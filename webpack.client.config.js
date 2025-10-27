// webpack.client.config.js
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isDev = argv && argv.mode === "development";

  const base = {
    entry: "./src/client/index.js",
    output: {
      filename: "main.js",
      path: path.resolve(__dirname, "dist"),
      clean: true,
    },
    target: "web",
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      // copiar siempre public (para build). Si quieres evitar copiar en dev, envía this plugin sólo cuando !isDev.
      new CopyWebpackPlugin({
        patterns: [
          { from: "public", to: "." },
          { from: "data", to: "data" }, // copia tus JSONs al build
        ],
      }),
    ],
  };

  if (isDev) {
    // configuración exclusiva para desarrollo
    base.devServer = {
      static: {
        directory: path.join(__dirname, "public"),
      },
      compress: true,
      port: 9000,
      proxy: {
        "/api": "http://localhost:3000",
        "/data": "http://localhost:3000",
      },
      historyApiFallback: {
        index: "/views/index.html",
      },
      open: true,
      hot: true,
    };
  } else {
    // producción: optimizaciones adicionales si quieres
    base.mode = "production";
    // no agregamos devServer en producción
  }

  return base;
};
