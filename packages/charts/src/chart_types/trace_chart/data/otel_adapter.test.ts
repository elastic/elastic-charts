/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { anyValueToString, fromOtlp, nanoToMs } from './otel_adapter';
import type { OtlpEnvelope, OtelSpan } from './otel_adapter';

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
