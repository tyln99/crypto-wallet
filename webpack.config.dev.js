const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
var webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const Dotenv = require('dotenv-webpack')

module.exports = {
  devtool: 'cheap-module-source-map', //for development
  entry: {
    index: {
      import: path.join(__dirname, 'app', 'scripts', 'ui.js')
    },
    inpage: {
      import: path.join(__dirname, 'app', 'scripts', 'inpage.js'),
      library: {
        // all options under `output.library` can be used here
        name: 'inpage',
        type: 'umd',
        umdNamedDefine: true
      }
    },
    contentscript: {
      import: path.join(__dirname, 'app', 'scripts', 'contentscript.js'),
      library: {
        // all options under `output.library` can be used here
        name: 'contentscript',
        type: 'umd',
        umdNamedDefine: true
      }
    },
    background: {
      import: path.join(__dirname, 'app', 'scripts', 'background.js'),
      library: {
        // all options under `output.library` can be used here
        name: 'background',
        type: 'umd',
        umdNamedDefine: true
      }
    }
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    //filename: '[name].bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.json'],
    alias: {
      '@ui': path.resolve(__dirname, 'ui'),
      '@resources': path.resolve(__dirname, 'ui/resources'),
      '@hooks': path.resolve(__dirname, 'ui/hooks'),
      '@components': path.resolve(__dirname, 'ui/components'),
      '@pages': path.resolve(__dirname, 'ui/pages'),
      '@config': path.resolve(__dirname, 'ui/config'),
      '@common': path.resolve(__dirname, 'ui/common'),
      '@actions': path.resolve(__dirname, 'ui/actions'),
      '@services': path.resolve(__dirname, 'ui/services'),
      '@selectors': path.resolve(__dirname, 'ui/selectors'),
      '@mock': path.resolve(__dirname, 'ui/mock'),
      '@assets': path.resolve(__dirname, 'ui/assets'),
      '@thunks': path.resolve(__dirname, 'ui/thunks'),
      '@providers': path.resolve(__dirname, 'ui/providers'),
      '@store': path.resolve(__dirname, 'ui/store'),
      '@app': path.resolve(__dirname, 'app'),
      '@shared': path.resolve(__dirname, 'shared'),
      styles: path.join(__dirname, 'ui/resources/scss'),
      images: path.join(__dirname, 'ui/resources/images')
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify')
    }
  },
  module: {
    rules: [
      {
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images' // by default it creates a media folder
            }
          }
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader'
      },
      { test: /\.eot(\?v=\d+.\d+.\d+)?$/, loader: 'file-loader' },
      {
        test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
        loader: 'url-loader'
      }
    ]
  },
  devServer: {
    historyApiFallback: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.join(__dirname, 'public', 'index.html'),
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'notification.html',
      template: path.join(__dirname, 'public', 'notification.html'),
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'home.html',
      template: path.join(__dirname, 'public', 'home.html'),
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      filename: 'background.html',
      template: path.join(__dirname, 'public', 'background.html'),
      chunks: ['background', 'global']
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer']
    }),
    new CopyPlugin({
      patterns: [{ from: './manifest/manifestv2.json', to: './manifest.json' }]
    }),
    new NodePolyfillPlugin(),
    new Dotenv()
  ],
  mode: 'development'
}
