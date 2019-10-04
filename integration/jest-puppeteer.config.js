const port = process.env.PORT || 9001;
const host = process.env.HOST || 'localhost';

/**
 * combined config object
 *
 * https://github.com/smooth-code/jest-puppeteer/tree/master/packages/jest-environment-puppeteer#jest-puppeteerconfigjs
 */
module.exports = {
  launch: {
    dumpio: false,
    headless: process.env.NODE_ENV === 'ci',
    slowMo: process.env.NODE_ENV === 'ci' ? 0 : 300,
    browserUrl: `http://${host}:${port}/iframe.html`,
  },
  server: {
    command: `RNG_SEED='elastic-charts' yarn start --port=${port}`,
    port,
    usedPortAction: 'ask',
    launchTimeout: 60000,
    debug: false,
  },
};
