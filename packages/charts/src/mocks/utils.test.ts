/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import type * as UtilsModule from './utils';

type Utils = typeof UtilsModule;

/** a fresh copy of the module, with its own set of registered generators */
function loadModule(): Utils {
  let utils: Utils | undefined;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    utils = require('./utils') as Utils;
  });
  return utils!;
}

/** VRT mode is read when a generator is created, so it stays on for the whole test */
function loadInVrtMode(): Utils {
  process.env.VRT = 'true';
  return loadModule();
}

const previousVrt = process.env.VRT;
afterEach(() => {
  process.env.VRT = previousVrt;
});

const draw = (rng: (min?: number, max?: number, fractionDigits?: number) => number, count: number) =>
  Array.from({ length: count }, () => rng(0, 1_000_000));

describe('seeded generators on the shared VRT page', () => {
  it('resets a number generator to its state after module evaluation, repeatedly', () => {
    const { getRandomNumberGenerator, checkpointRandomNumberGenerators, resetRandomNumberGenerators } = loadInVrtMode();
    const rng = getRandomNumberGenerator();
    const moduleLevel = draw(rng, 3);
    checkpointRandomNumberGenerators();
    const firstMount = draw(rng, 4);
    // the mount draws continue the sequence, they are not its start
    expect(moduleLevel).toHaveLength(3);
    expect(firstMount).not.toEqual(draw(getRandomNumberGenerator(), 4));

    resetRandomNumberGenerators();
    expect(draw(rng, 4)).toEqual(firstMount);
    resetRandomNumberGenerators();
    expect(draw(rng, 4)).toEqual(firstMount);
  });

  it('keeps the first checkpoint when later story imports checkpoint again', () => {
    const { getRandomNumberGenerator, checkpointRandomNumberGenerators, resetRandomNumberGenerators } = loadInVrtMode();
    const rng = getRandomNumberGenerator();
    draw(rng, 2);
    checkpointRandomNumberGenerators();
    const firstMount = draw(rng, 3);
    checkpointRandomNumberGenerators(); // another story module imported later
    resetRandomNumberGenerators();
    expect(draw(rng, 3)).toEqual(firstMount);
  });

  it('restarts a generator created while a story mounts from its seed', () => {
    const { getRandomNumberGenerator, checkpointRandomNumberGenerators, resetRandomNumberGenerators } = loadInVrtMode();
    checkpointRandomNumberGenerators();
    const rng = getRandomNumberGenerator();
    const fresh = draw(rng, 3);
    resetRandomNumberGenerators();
    expect(draw(rng, 3)).toEqual(fresh);
  });

  it('does the same for an entry generator', () => {
    const { getRandomEntryFn, checkpointRandomNumberGenerators, resetRandomNumberGenerators } = loadInVrtMode();
    const entries = Array.from({ length: 1000 }, (_, i) => i);
    const pick = getRandomEntryFn();
    const picks = (count: number) => Array.from({ length: count }, () => pick(entries));
    picks(5);
    checkpointRandomNumberGenerators();
    const firstMount = picks(5);
    resetRandomNumberGenerators();
    expect(picks(5)).toEqual(firstMount);
  });

  it('leaves generators alone outside VRT mode', () => {
    process.env.VRT = 'false';
    const { getRandomNumberGenerator, checkpointRandomNumberGenerators, resetRandomNumberGenerators } = loadModule();
    const rng = getRandomNumberGenerator('seed');
    checkpointRandomNumberGenerators();
    const first = draw(rng, 3);
    resetRandomNumberGenerators();
    expect(draw(rng, 3)).not.toEqual(first);
  });
});
