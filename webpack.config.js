const path = require('path');

module.exports = {
  mode: 'production', // Change to 'development' if needed
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'eda_chatassistant',
    libraryTarget: 'umd',
    assetModuleFilename: 'images/[name][ext]', // Ensures images are saved in the 'images' folder in dist
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource', // Uses the new asset module feature for images
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
    },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
  },
  devtool: 'source-map', // Optional: Include source maps for easier debugging
};
