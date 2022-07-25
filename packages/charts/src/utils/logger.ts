/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/* eslint-disable no-console */

/**
 * Helper class to assist with logging warnings
 *
 * @internal
 * @todo Add more helpful messages in dev for configuration errors
 */
export class Logger {
  static namespace = '[@elastic/charts]';

  /**
   * Log warning to console
   *
   * @param message
   * @param optionalParams
   */
  static warn(message?: unknown, ...optionalParams: unknown[]) {
    if (Logger.isDevelopment() && !Logger.isTest()) {
      console.warn(`${Logger.namespace} ${message}`, ...optionalParams);
    }
  }

  /**
   * Log expected value warning to console
   */
  static expected(message: unknown, expected: unknown, received: unknown) {
    if (Logger.isDevelopment() && !Logger.isTest()) {
      console.warn(
        `${Logger.namespace} ${message}`,
        `\n
  Expected: ${expected}
  Received: ${received}
`,
      );
    }
  }

  /**
   * Log error to console
   *
   * @param message
   * @param optionalParams
   */
  static error(message?: unknown, ...optionalParams: unknown[]) {
    if (Logger.isDevelopment() && !Logger.isTest()) {
      console.error(`${Logger.namespace} ${message}`, ...optionalParams);
    }
  }

  /**
   * Determined development env
   *
   * @todo confirm this logic works
   * @todo add more robust logic
   */
  private static isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Determined development env
   *
   * @todo confirm this logic works
   * @todo add more robust logic
   */
  private static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}

/* eslint-enable */
