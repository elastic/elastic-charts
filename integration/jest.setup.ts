import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const customConfig = { threshold: 0.01 };
const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: customConfig,
  failureThreshold: 0.01,
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });
