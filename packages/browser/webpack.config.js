const path = require('path');
const mode = process.env.NODE_ENV;
const webpack = require('webpack');
const { merge } = require('webpack-merge');

const debugBuild = mode === 'development';

const rules = [
  {
    // We also want to (web)pack the style files:
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
  },
];
// Inject environnement variables (they have to be declare in your .env !!!)
const keyEnvVariables = ['MY_ENV_VARIABLE'];
const plugins = [];
const params = {};
keyEnvVariables.forEach(function (key) {
  console.log(key, ' = ', JSON.stringify(process.env[key]));
  params[key] = JSON.stringify(process.env[key]);
});
plugins.push(new webpack.DefinePlugin(params));
// possible de write in sources DEBUG flag that is going to be replace by a boolean during webpack
plugins.push(
  new webpack.DefinePlugin({
    DEBUG: debugBuild,
  })
);

const commonConfig = {
  entry: path.resolve(__dirname, './src/bootstrap.js'),
  output: {
    filename: 'bundle.js',
    library: 'myAppNameBrowser',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: rules,
  },
  plugins: plugins,
};

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist/debug'),
  },
};

const prodConfig = {
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist/release'),
  },
};

module.exports = merge(commonConfig, debugBuild ? devConfig : prodConfig);
