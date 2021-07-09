/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

const baseConfig = require('./jest.config');

const TIMEZONES = {
  'Asia/Tokyo': {
    extension: 'jp',
    name: 'America/Tokyo',
    color: 'blue',
  },
  'America/New_York': {
    extension: 'ny',
    name: 'America/Tokyo',
    color: 'blue',
  },
  UTC: {
    extension: 'utc',
    name: 'UTC',
    color: 'blue',
  },
};

const { extension, name, color = 'blue' } = TIMEZONES[process.env.TZ] || {};

if (!extension || !name) {
  throw new Error('Invalid time zone provided to jest.tz.config.js');
}

module.exports = Object.assign(baseConfig, {
  testMatch: [`**/?(*.)tz.+(test)?(.${extension}).[jt]s?(x)`],
  displayName: {
    name: `TIMEZONE: ${name}`,
    color,
  },
});
