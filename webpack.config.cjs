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
        // Add support for importing .wgsl files as raw strings
        { test: /\.wgsl$/i, type: 'asset/source' },
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
        // Add support for importing .wgsl files as raw strings
        { test: /\.wgsl$/i, type: 'asset/source' },
      ],
    },
    devtool: 'source-map',
  },
  // Debug CommonJS build (development, no minification, friendly source maps)
  {
    mode: 'development',
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'tiny-helix.debug.js',
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
        // Add support for importing .wgsl files as raw strings
        { test: /\.wgsl$/i, type: 'asset/source' },
      ],
    },
    optimization: {
      minimize: false,
    },
    // Use full source maps and ensure sources are file URLs so browsers can resolve them
    devtool: 'source-map',
  },
  // Debug ES Module build (development, no minification, friendly source maps)
  {
    mode: 'development',
    entry: './src/index.ts',
    experiments: {
      outputModule: true,
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'tiny-helix.esm.debug.js',
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
        // Add support for importing .wgsl files as raw strings
        { test: /\.wgsl$/i, type: 'asset/source' },
      ],
    },
    optimization: {
      minimize: false,
    },
    devtool: 'source-map',
  },
];
