/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { anyValueToString, fromOtlp, nanoToMs } from './otel_adapter';
import type { OtlpEnvelope, OtelSpan } from './otel_adapter';
import { Logger } from '../../../utils/logger';

// ---------------------------------------------------------------------------
// anyValueToString — real OTLP AnyValue wrappers
// ---------------------------------------------------------------------------

describe('anyValueToString', () => {
  it('extracts stringValue from a real OTLP AnyValue', () => {
    expect(anyValueToString({ stringValue: 'checkout' })).toBe('checkout');
  });

  it('extracts intValue (number form) from a real OTLP AnyValue', () => {
    expect(anyValueToString({ intValue: 42 })).toBe('42');
  });

  it('extracts intValue (string form, as emitted by some exporters)', () => {
    expect(anyValueToString({ intValue: '99' })).toBe('99');
  });

  it('extracts doubleValue from a real OTLP AnyValue', () => {
    expect(anyValueToString({ doubleValue: 3.14 })).toBe('3.14');
  });

  it('extracts boolValue from a real OTLP AnyValue', () => {
    expect(anyValueToString({ boolValue: true })).toBe('true');
    expect(anyValueToString({ boolValue: false })).toBe('false');
  });

  it('falls back to String() for the flat-scalar shape used by story fixtures', () => {
    // The simplified story fixtures pass a plain string as value (not an AnyValue wrapper).
    expect(anyValueToString('GET')).toBe('GET');
    expect(anyValueToString(200)).toBe('200');
  });

  it('falls back to String() for unknown object shapes (arrayValue etc.)', () => {
    // arrayValue / kvlistValue are not useful as color-group keys — don't crash, just stringify.
    const result = anyValueToString({ arrayValue: { values: [] } });
    expect(typeof result).toBe('string');
  });
});

// ---------------------------------------------------------------------------
// nanoToMs — existing contract + edge cases
// ---------------------------------------------------------------------------

describe('nanoToMs', () => {
  it('converts a well-formed nanosecond string to milliseconds', () => {
    expect(nanoToMs('1000000')).toBeCloseTo(1, 6); // 1 ms
    expect(nanoToMs('500000')).toBeCloseTo(0.5, 6); // 0.5 ms
  });

  it('handles bigint and number inputs', () => {
    expect(nanoToMs(1_000_000n)).toBeCloseTo(1, 6);
    expect(nanoToMs(1_000_000)).toBeCloseTo(1, 6);
  });

  it('returns NaN and warns for malformed strings', () => {
    expect(nanoToMs('abc')).toBeNaN();
    expect(nanoToMs('12.5')).toBeNaN(); // non-integer string
  });

  it('preserves exact ms precision for string nanos beyond Number.MAX_SAFE_INTEGER', () => {
    // Real epoch nanos (~1.9e18) exceed the 9.0e15 safe-integer ceiling. The bigint path keeps the
    // integer-ms magnitude exact; the sub-ms tail is carried as a separate fractional term.
    // 1_700_000_000_123_456_789 ns = 1_700_000_000_123.456789 ms.
    expect(nanoToMs('1700000000123456789')).toBeCloseTo(1_700_000_000_123.456789, 3);
  });

  it('warns and falls back to float division for a number input past the safe-integer ceiling', () => {
    const warnSpy = jest.spyOn(Logger, 'warn').mockImplementation(() => {});
    // A number this large already lost its low-order digits to IEEE-754 before nanoToMs ran; the
    // ms-scale result is still correct, and we warn so callers pass strings/bigints for full fidelity.
    const unsafe = 1_700_000_000_123_456_789; // not a safe integer
    expect(nanoToMs(unsafe)).toBeCloseTo(unsafe / 1_000_000, 0);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    warnSpy.mockRestore();
  });

  it('returns NaN for a non-finite number without throwing', () => {
    expect(nanoToMs(Number.POSITIVE_INFINITY)).toBeNaN();
    expect(nanoToMs(Number.NaN)).toBeNaN();
  });
});

// ---------------------------------------------------------------------------
// fromOtlp — real OTLP AnyValue attributes round-trip
// ---------------------------------------------------------------------------

describe('fromOtlp — AnyValue attributes', () => {
  it('preserves span attributes with real OTLP AnyValue wrappers on the meta field', () => {
    const envelope: OtlpEnvelope = {
      resourceSpans: [{
        resource: {
          attributes: [{ key: 'service.name', value: { stringValue: 'checkout-service' } }],
        },
        scopeSpans: [{
          spans: [{
            spanId: 'span1',
            name: 'GET /cart',
            startTimeUnixNano: '1000000000',
            endTimeUnixNano:   '2000000000',
            attributes: [{ key: 'http.method', value: { stringValue: 'GET' } }],
          } satisfies OtelSpan],
        }],
      }],
    };

    const [datum] = fromOtlp(envelope);
    expect(datum).toBeDefined();
    const meta = datum!.meta as OtelSpan;

    // Span-level attribute: AnyValue shape preserved on meta
    expect(meta.attributes?.[0]).toEqual({ key: 'http.method', value: { stringValue: 'GET' } });
    // Resource attribute: AnyValue shape preserved on meta.resource
    expect(meta.resource?.attributes?.[0]).toEqual({ key: 'service.name', value: { stringValue: 'checkout-service' } });
  });
});
