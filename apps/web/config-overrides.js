const { override, addWebpackPlugin } = require('customize-cra');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = override(
  (config) => {
    config.plugins = config.plugins.filter((plugin) => !plugin.constructor.name.includes('ESLint'));

    if (config.module && config.module.rules) {
      config.module.rules = config.module.rules.filter((rule) => {
        if (rule.use && Array.isArray(rule.use)) {
          return !rule.use.some(
            (use) =>
              (typeof use === 'string' && use.includes('eslint')) ||
              (typeof use === 'object' && use.loader && use.loader.includes('eslint')),
          );
        }
        return true;
      });
    }
    // Remove existing HtmlWebpackPlugin instances
    config.plugins = config.plugins.filter((plugin) => !(plugin instanceof HtmlWebpackPlugin));

    return config;
  },
  addWebpackPlugin(
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      hash: true, // This will add a unique hash to the filenames
    }),
  ),
);
