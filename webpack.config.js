const path = require("path");
const HtmlPlugin = require("./lib/plugins/html-plugin.js");

module.exports = {
  mode: "none",
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [path.resolve(__dirname, "lib/loaders/remover-console.js")]
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      template: "./src/index.html", //用到的模板文件
      filename: "newIndex.html" //生成的html文件命名
    })
  ]
};
