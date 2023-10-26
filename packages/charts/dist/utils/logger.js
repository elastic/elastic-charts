"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    static warn(message, ...optionalParams) {
        if (Logger.isDevelopment() && !Logger.isTest()) {
            console.warn(`${Logger.namespace} ${message}`, ...optionalParams);
        }
    }
    static expected(message, expected, received) {
        if (Logger.isDevelopment() && !Logger.isTest()) {
            console.warn(`${Logger.namespace} ${message}`, `\n
  Expected: ${expected}
  Received: ${received}
`);
        }
    }
    static error(message, ...optionalParams) {
        if (Logger.isDevelopment() && !Logger.isTest()) {
            console.error(`${Logger.namespace} ${message}`, ...optionalParams);
        }
    }
    static isDevelopment() {
        return process.env.NODE_ENV !== 'production';
    }
    static isTest() {
        return process.env.NODE_ENV === 'test';
    }
}
exports.Logger = Logger;
Logger.namespace = '[@elastic/charts]';
//# sourceMappingURL=logger.js.map