const webpack = require('webpack');
const Chain = require('webpack-chain');
const fs = require('fs-extra');
const path = require('path');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const getWebpackBase = require('rax-webpack-config');
const getBabelConfig = require('rax-babel-config');

module.exports = (context, options = {}, target) => {
  const { rootDir, command } = context;

  const babelConfig = getBabelConfig({
    styleSheet: true,
    ...options,
  });

  const config = getWebpackBase({
    ...context,
    babelConfig: babelConfig,
  });

  config.target('web');
  config.context(rootDir);

  config.resolve.alias
    .set('@core/app', 'universal-app-runtime')
    .set('@core/page', 'universal-app-runtime')
    .set('@core/router', 'universal-app-runtime');

  // Process app.json file
  config.module.rule('appJSON')
    .type('javascript/auto')
    .test(/app\.json$/)
    .use('babel')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
    .end()
    .use('loader')
    .loader(require.resolve('../loaders/AppConfigLoader'));

  config.module.rule('tsx')
    .use('ts')
    .loader(require.resolve('ts-loader'))
    .options({
      transpileOnly: true,
    })
    .end()
    .use('platform')
    .loader(require.resolve('rax-compile-config/src/platformLoader'));

  config.plugin('caseSensitivePaths')
    .use(CaseSensitivePathsPlugin);

  if (target && fs.existsSync(path.resolve(rootDir, 'src/public'))) {
    config.plugin('copyWebpackPlugin')
      .use(CopyWebpackPlugin, [[{ from: 'src/public', to: `${target}/public` }]]);
  }

  config.externals([
    function(ctx, request, callback) {
      if (request.indexOf('@weex-module') !== -1) {
        return callback(null, `commonjs ${request}`);
      }

      // compatible with @system for quickapp
      if (request.indexOf('@system') !== -1) {
        return callback(null, `commonjs ${request}`);
      }
      callback();
    },
  ]);

  config.plugin('noError')
    .use(webpack.NoEmitOnErrorsPlugin);

  const copyWebpackPluginPatterns = [{ from: 'src/public', to: `${target}/public` }];

  if (command === 'start') {
    config.mode('development');
    config.devtool('inline-module-source-map');
    // MiniApp usually use `./public/xxx.png` as file src.
    // Dev Server start with '/'. if you want to use './public/xxx.png', should copy public to the root.
    copyWebpackPluginPatterns.push({ from: 'src/public', to: 'public' });
  } else if (command === 'build') {
    config.mode('production');

    config.optimization
      .minimizer('terser')
      .use(TerserPlugin, [{
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }])
      .end()
      .minimizer('optimizeCSS')
      .use(OptimizeCSSAssetsPlugin);
  }

  if (target && fs.existsSync(path.resolve(rootDir, 'src/public'))) {
    config.plugin('copyWebpackPlugin')
      .use(CopyWebpackPlugin, [copyWebpackPluginPatterns]);
  }

  return config;
};
