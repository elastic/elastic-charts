const port = 9001;
const host = 'localhost';

/**
 * combined config object
 *
 * https://github.com/smooth-code/jest-puppeteer/tree/master/packages/jest-environment-puppeteer#jest-puppeteerconfigjs
 */
module.exports = {
  launch: {
    dumpio: false,
    headless: true,
    slowMo: 0,
    browserUrl: `http://${host}:${port}/iframe.html`,
    args: ['--font-render-hinting=medium'],
  },
  server: {
    command: `RNG_SEED='elastic-charts' yarn start --port=${port}`,
    port,
    usedPortAction: 'ask',
    launchTimeout: 60000,
    debug: false,
  },
};
