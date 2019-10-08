const getConfig = require('jest-puppeteer-docker/lib/config');
const baseConfig = getConfig();

const port = 9001;
const host = '0.0.0.0';

/**
 * combined config object
 *
 * https://github.com/smooth-code/jest-puppeteer/tree/master/packages/jest-environment-puppeteer#jest-puppeteerconfigjs
 */
const customConfig = Object.assign(
  {
    launch: {
      dumpio: false,
      headless: true,
      slowMo: 0,
      browserUrl: `http://${host}:${port}/iframe.html`,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    server: {
      command: `RNG_SEED='elastic-charts' yarn start --port=${port} --ci --quiet`,
      port,
      usedPortAction: 'ask',
      launchTimeout: 120000,
      debug: false,
    },
  },
  baseConfig,
);

module.exports = customConfig;
