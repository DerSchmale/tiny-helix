const path = require('path');

module.exports = [
  // CommonJS build
  {
    mode: 'production',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'tiny-helix.js',
      library: {
        name: 'TinyHelix',
        type: 'umd',
        export: 'default',
      },
      globalObject: 'this',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    devtool: 'source-map',
  },
  // ES Module build
  {
    mode: 'production',
    entry: './src/index.ts',
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'tiny-helix.esm.js',
      library: {
        type: 'module',
      },
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    devtool: 'source-map',
  },
];
