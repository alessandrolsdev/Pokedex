const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin'); // <-- 1. IMPORTAMOS O PLUGIN

module.exports = {
  mode: 'development',
  entry: './src/js/main.js', // (Verifique se é o seu arquivo de entrada)
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.css',
    }),
    new HtmlWebpackPlugin({
      template: './index.html', // O molde na raiz
    }),
    
    // ----- 2. ADICIONAMOS O PLUGIN AQUI -----
    // Ele vai copiar sua pasta de imagens para o build final
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/imagens', to: 'imagens' }, // Copia de 'src/imagens' para 'dist/imagens'
      ],
    }),
    // ------------------------------------
  ],
  
  devServer: {
    static: './dist',
    hot: true,
  },
};