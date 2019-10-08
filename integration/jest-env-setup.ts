import { configureToMatchImageSnapshot } from 'jest-image-snapshot';

const customConfig = { threshold: 0.05 };
export const toMatchImageSnapshot = configureToMatchImageSnapshot({
  customDiffConfig: customConfig,
  failureThreshold: 0.05,
  failureThresholdType: 'percent',
});

expect.extend({ toMatchImageSnapshot });
