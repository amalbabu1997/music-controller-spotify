const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, './static/frontend'),
      filename: 'main.js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: isProduction,
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          isProduction ? 'production' : 'development'
        ),
      }),
    ],
    devtool: isProduction ? false : 'source-map',
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'static'),
      },
      compress: true,
      hot: true,
      port: 3000,
      proxy: {
        '/': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
      historyApiFallback: true,
    },
  };
};
