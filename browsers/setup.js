const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');
const config = require(path.join(__dirname, '..', '.playground', 'webpack.config.js'));

module.exports = async () => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-console
    console.log('Starting the dev web server...', __dirname);

    const port = 8080;

    const server = new WebpackDevServer(webpack(config));

    server.listen(port, 'localhost', function(err) {
      if (err) {
        reject(err);
      }
      resolve();
      console.log('WebpackDevServer listening at localhost:', port);
      global.__WP_SERVER__ = server;
    });
  });
};
