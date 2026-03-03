/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/** @internal */
export const BARCHART_1Y0G = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 10 },
  { x: 3, y: 6 },
];

/** @internal */
export const BARCHART_1Y0G_LINEAR = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2.5, y: 10 },
  { x: 3.5, y: 6 },
];
/** @internal */
export const BARCHART_1Y1G = [
  { x: 0, g: 'a', y: 1 },
  { x: 0, g: 'b', y: 2 },
  { x: 1, g: 'a', y: 2 },
  { x: 1, g: 'b', y: 3 },
  { x: 2, g: 'a', y: 3 },
  { x: 2, g: 'b', y: 4 },
  { x: 3, g: 'a', y: 4 },
  { x: 3, g: 'b', y: 5 },
];
/** @internal */
export const BARCHART_1Y1G_ORDINAL = [
  { x: 'a', g: 'a', y: 1 },
  { x: 'a', g: 'b', y: 2 },
  { x: 'b', g: 'a', y: 2 },
  { x: 'b', g: 'b', y: 3 },
  { x: 'c', g: 'a', y: 3 },
  { x: 'd', g: 'b', y: 4 },
  { x: 'e', g: 'a', y: 4 },
  { x: 'e', g: 'b', y: 5 },
];

/** @internal */
export const BARCHART_1Y1G_LINEAR = [
  { x: 0, g: 'a', y: 1 },
  { x: 0, g: 'b', y: 1 },
  { x: 1, g: 'a', y: 2 },
  { x: 1, g: 'b', y: 2 },
  { x: 2, g: 'a', y: 10 },
  { x: 2, g: 'b', y: 20 },
  { x: 3, g: 'a', y: 6 },
  { x: 5, g: 'a', y: 2 },
  { x: 7, g: 'b', y: 3 },
];

/** @internal */
export const BARCHART_1Y2G = [
  { x: 0, g1: 'a', g2: 's', y: 1 },
  { x: 0, g1: 'a', g2: 'p', y: 1 },
  { x: 0, g1: 'b', g2: 's', y: 1 },
  { x: 0, g1: 'b', g2: 'p', y: 1 },
  { x: 1, g1: 'a', g2: 's', y: 2 },
  { x: 1, g1: 'a', g2: 'p', y: 2 },
  { x: 1, g1: 'b', g2: 's', y: 2 },
  { x: 1, g1: 'b', g2: 'p', y: 2 },
  { x: 2, g1: 'a', g2: 's', y: 1 },
  { x: 2, g1: 'a', g2: 'p', y: 2 },
  { x: 2, g1: 'b', g2: 's', y: 3 },
  { x: 2, g1: 'b', g2: 'p', y: 4 },
  { x: 3, g1: 'a', g2: 's', y: 6 },
  { x: 3, g1: 'a', g2: 'p', y: 6 },
  { x: 3, g1: 'b', g2: 's', y: 6 },
  { x: 3, g1: 'b', g2: 'p', y: 6 },
];

/** @internal */
export const BARCHART_2Y0G = [
  { x: 0, y1: 1, y2: 3 },
  { x: 1, y1: 2, y2: 7 },
  { x: 2, y1: 1, y2: 2 },
  { x: 3, y1: 6, y2: 10 },
];

/** @internal */
export const CHART_ORDINAL_2Y0G = [
  { x: 'a', y1: 1, y2: 3 },
  { x: 'b', y1: 2, y2: 7 },
  { x: 'c', y1: 1, y2: 2 },
  { x: 'd', y1: 6, y2: 10 },
];

/** @internal */
export const BARCHART_2Y1G = [
  { x: 0, g: 'a', y1: 1, y2: 4 },
  { x: 0, g: 'b', y1: 3, y2: 6 },
  { x: 1, g: 'a', y1: 2, y2: 1 },
  { x: 1, g: 'b', y1: 2, y2: 5 },
  { x: 2, g: 'a', y1: 10, y2: 5 },
  { x: 2, g: 'b', y1: 3, y2: 1 },
  { x: 3, g: 'a', y1: 7, y2: 3 },
  { x: 3, g: 'b', y1: 6, y2: 4 },
];

/** @internal */
export const BARCHART_2Y2G = [
  { x: 0, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 1, y2: 4 },
  { x: 0, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 1, y2: 4 },
  { x: 0, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 3, y2: 6 },
  { x: 0, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 3, y2: 6 },
  { x: 1, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 2, y2: 1 },
  { x: 1, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 2, y2: 1 },
  { x: 1, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 2, y2: 5 },
  { x: 1, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 2, y2: 5 },
  { x: 2, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 10, y2: 5 },
  { x: 2, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 10, y2: 5 },
  { x: 2, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 3, y2: 1 },
  { x: 2, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 3, y2: 1 },
  { x: 3, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 7, y2: 3 },
  { x: 3, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 7, y2: 3 },
  { x: 3, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 6, y2: 4 },
  { x: 3, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 6, y2: 4 },
  { x: 6, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 7, y2: 3 },
  { x: 6, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 7, y2: 3 },
  { x: 6, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 6, y2: 4 },
  { x: 6, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 6, y2: 4 },
];

/** @interrnal */
export const BARCHART_2Y2G_VARIED_LEGEND = [
  // x = 0
  { x: 0, g1: 'Chrome', g2: 'Windows 11', y1: 42, y2: 18 },
  {
    x: 0,
    g1: 'Safari',
    g2: 'iOS17iPhone15,3AppleWebKit605.1.15',
    y1: 28,
    y2: 12,
  },
  { x: 0, g1: 'Firefox', g2: 'Linux', y1: 9, y2: 5 },
  {
    x: 0,
    g1: 'ChromeMobileAndroid14Pixel8ProUltraEdition',
    g2: 'Android 14 • Pixel 8 Pro',
    y1: 21,
    y2: 8,
  },
  {
    x: 0,
    g1: 'Edge',
    g2: 'Windows 10 (Corporate Managed)',
    y1: 14,
    y2: 7,
  },

  // x = 1
  {
    x: 1,
    g1: 'ChromeMobile',
    g2: 'Android13SMG998BGalaxyS21International',
    y1: 17,
    y2: 7,
  },
  { x: 1, g1: 'Safari', g2: 'macOS', y1: 19, y2: 10 },
  {
    x: 1,
    g1: 'Chrome',
    g2: 'Windows11IntelIrisXeGraphicsEnUS',
    y1: 7,
    y2: 2,
  },
  { x: 1, g1: 'Firefox', g2: 'Windows 11', y1: 8, y2: 4 },
  {
    x: 1,
    g1: 'SamsungInternet',
    g2: 'AndroidOneUI',
    y1: 6,
    y2: 3,
  },
  {
    x: 1,
    g1: 'Bot',
    g2: 'EmbeddedWebViewInternalCrawler',
    y1: 3,
    y2: 1,
  },

  // x = 2
  { x: 2, g1: 'Edge', g2: 'Windows 10', y1: 12, y2: 6 },
  {
    x: 2,
    g1: 'Safari',
    g2: 'iPadOS17iPadPro12.9Inch6thGeneration',
    y1: 9,
    y2: 4,
  },
  { x: 2, g1: 'Chrome', g2: 'Windows 11', y1: 48, y2: 22 },
  {
    x: 2,
    g1: 'Chrome',
    g2: 'Windows11KHTMLlikeGecko120.0.0.0',
    y1: 4,
    y2: 1,
  },
  { x: 2, g1: 'Firefox', g2: 'Linux', y1: 10, y2: 6 },
  { x: 2, g1: 'Safari', g2: 'iOS', y1: 31, y2: 15 },

  // x = 3
  {
    x: 3,
    g1: 'Edge',
    g2: 'Windows11MicrosoftDefenderForEndpointEnterpriseManaged',
    y1: 5,
    y2: 2,
  },
  { x: 3, g1: 'Chrome', g2: 'Windows 11', y1: 44, y2: 19 },
  {
    x: 3,
    g1: 'ChromeMobile',
    g2: 'Android14Pixel8',
    y1: 20,
    y2: 9,
  },
  {
    x: 3,
    g1: 'Bot',
    g2: 'GooglebotSmartphoneUserAgentString',
    y1: 2,
    y2: 1,
  },
  { x: 3, g1: 'Safari', g2: 'macOS', y1: 22, y2: 11 },
  { x: 3, g1: 'Firefox', g2: 'Windows 11', y1: 7, y2: 3 },

  // x = 4
  { x: 4, g1: 'Safari', g2: 'iOS', y1: 33, y2: 16 },
  {
    x: 4,
    g1: 'Safari',
    g2: 'iOS17iPhone15,3AppleWebKit605.1.15SafariMobile',
    y1: 6,
    y2: 2,
  },
  { x: 4, g1: 'Edge', g2: 'Windows 10', y1: 13, y2: 6 },
  { x: 4, g1: 'Chrome', g2: 'Windows 11', y1: 50, y2: 23 },
  { x: 4, g1: 'Firefox', g2: 'Linux', y1: 11, y2: 6 },
  {
    x: 4,
    g1: 'Chrome',
    g2: 'Windows11IntelIrisXeGraphicsDriverVersion31.0.101.5333',
    y1: 4,
    y2: 1,
  },
];

/** @internal */
export const BARCHART_2Y3G = [
  { x: 0, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 1, y2: 4, g3: 'somevalue' },
  { x: 0, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 1, y2: 4, g3: 'newvalue' },
  { x: 0, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 3, y2: 6, g3: 'somevalue' },
  { x: 0, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 3, y2: 6, g3: 'newvalue' },
  { x: 1, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 2, y2: 1, g3: 'somevalue' },
  { x: 1, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 2, y2: 1, g3: 'newvalue' },
  { x: 1, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 2, y2: 5, g3: 'somevalue' },
  { x: 1, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 2, y2: 5, g3: 'newvalue' },
  { x: 2, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 10, y2: 5, g3: 'somevalue' },
  { x: 2, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 10, y2: 5, g3: 'newvalue' },
  { x: 2, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 3, y2: 1, g3: 'somevalue' },
  { x: 2, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 3, y2: 1, g3: 'newvalue' },
  { x: 3, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 7, y2: 3, g3: 'somevalue' },
  { x: 3, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 7, y2: 3, g3: 'newvalue' },
  { x: 3, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 6, y2: 4, g3: 'somevalue' },
  { x: 3, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 6, y2: 4, g3: 'newvalue' },
  { x: 6, g1: 'cdn.google.com', g2: 'direct-cdn', y1: 7, y2: 3, g3: 'somevalue' },
  { x: 6, g1: 'cdn.google.com', g2: 'indirect-cdn', y1: 7, y2: 3, g3: 'newvalue' },
  { x: 6, g1: 'cloudflare.com', g2: 'direct-cdn', y1: 6, y2: 4, g3: 'somevalue' },
  { x: 6, g1: 'cloudflare.com', g2: 'indirect-cdn', y1: 6, y2: 4, g3: 'newvalue' },
];

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;
/** @internal */
export const TIME_CHART_2Y0G = [
  { x: NOW, y1: 1, y2: 3 },
  { x: NOW + DAY, y1: 2, y2: 7 },
  { x: NOW + DAY * 2, y1: 1, y2: 2 },
  { x: NOW + DAY * 3, y1: 6, y2: 10 },
];

export const SHORT_NAMES_BARCHART = [
  { x: 0, g: 'a', y: 1000 },
  { x: 0, g: 'b', y: 1 },
  { x: 0, g: 'c', y: 3 },
  { x: 0, g: 'd', y: 3 },
  { x: 1, g: 'e', y: null },
  { x: 1, g: 'f', y: null },
  { x: 1, g: 'g', y: null },
  { x: 1, g: 'h', y: null },
  { x: 2, g: 'i', y: 10 },
  { x: 2, g: 'j', y: 10 },
  { x: 2, g: 'k', y: 3 },
  { x: 2, g: 'l', y: 3 },
  { x: 3, g: 'm', y: 7 },
  { x: 3, g: 'n', y: 7 },
  { x: 3, g: 'o', y: 6 },
];

export const LONG_NAMES_BARCHART_2Y2G = [
  {
    x: 0,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'very-long-indirect-cdn-service-name-test-purpose-only',
    y1: 1,
    y2: 4,
  },
  {
    x: 0,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'another-extremely-long-indirect-cdn-service-name-used-for-testing',
    y1: 1,
    y2: 4,
  },
  {
    x: 0,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'very-long-direct-cdn-service-name-test-purpose-only',
    y1: 3,
    y2: 6,
  },
  {
    x: 0,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'another-extremely-long-direct-cdn-service-name-used-for-testing',
    y1: 3,
    y2: 6,
  },
  {
    x: 1,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'very-long-indirect-cdn-service-name-test-purpose-only',
    y1: 2,
    y2: 1,
  },
  {
    x: 1,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'another-extremely-long-indirect-cdn-service-name-used-for-testing',
    y1: 2,
    y2: 1,
  },
  {
    x: 1,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'very-long-direct-cdn-service-name-test-purpose-only',
    y1: 2,
    y2: 5,
  },
  {
    x: 1,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'another-extremely-long-direct-cdn-service-name-used-for-testing',
    y1: 2,
    y2: 5,
  },
  {
    x: 2,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'very-long-indirect-cdn-service-name-test-purpose-only',
    y1: 10,
    y2: 5,
  },
  {
    x: 2,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'another-extremely-long-indirect-cdn-service-name-used-for-testing',
    y1: 10,
    y2: 5,
  },
  {
    x: 2,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'very-long-direct-cdn-service-name-test-purpose-only',
    y1: 3,
    y2: 1,
  },
  {
    x: 2,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'another-extremely-long-direct-cdn-service-name-used-for-testing',
    y1: 3,
    y2: 1,
  },
  {
    x: 3,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'very-long-indirect-cdn-service-name-test-purpose-only',
    y1: 7,
    y2: 3,
  },
  {
    x: 3,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'another-extremely-long-indirect-cdn-service-name-used-for-testing',
    y1: 7,
    y2: 3,
  },
  {
    x: 3,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'very-long-direct-cdn-service-name-test-purpose-only',
    y1: 6,
    y2: 4,
  },
  {
    x: 3,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'another-extremely-long-direct-cdn-service-name-used-for-testing',
    y1: 6,
    y2: 4,
  },
  {
    x: 6,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'very-long-indirect-cdn-service-name-test-purpose-only',
    y1: 7,
    y2: 3,
  },
  {
    x: 6,
    g1: 'cdn.extremelylongdomainnameforexampletest.com',
    g2: 'another-extremely-long-indirect-cdn-service-name-used-for-testing',
    y1: 7,
    y2: 3,
  },
  {
    x: 6,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'very-long-direct-cdn-service-name-test-purpose-only',
    y1: 6,
    y2: 4,
  },
  {
    x: 6,
    g1: 'quitelongdomainnamefortestingpurpose.com',
    g2: 'another-extremely-long-direct-cdn-service-name-used-for-testing',
    y1: 6,
    y2: 4,
  },
];
