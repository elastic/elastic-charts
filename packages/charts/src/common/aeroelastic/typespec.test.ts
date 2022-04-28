/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Json, Selector, Vector2d, Vector3d, TransformMatrix2d, TransformMatrix3d } from '.';
import { mvMultiply as mult3d, ORIGIN as UNIT3D, NANMATRIX as NANMATRIX3D, add as add3d } from './matrix';
import { mvMultiply as mult2d, ORIGIN as UNIT2D, UNITMATRIX as UNITMATRIX2D, add as add2d } from './matrix2d';
import { select } from './select';

// helper to mark variables as "used" so they don't trigger errors
const use = (...vars: any[]) => vars.includes(null);

/*
  Type checking isn't too useful if future commits can accidentally weaken the type constraints, because a
  TypeScript linter will not complain - everything that passed before will continue to pass. The coder
  will not have feedback that the original intent with the typing got compromised. To declare the intent
  via passing and failing type checks, test cases are needed, some of which designed to expect a TS pass,
  some of them to expect a TS complaint. It documents intent for peers too, as type specs are a tough read.

  Test "cases" expecting to pass TS checks are not annotated, while ones we want TS to complain about
  are prepended with the comment

  // @ts-expect-error

  The test "suite" and "cases" are wrapped in IIFEs to prevent linters from complaining about the unused
  binding. It can be structured internally as desired.
*/

describe('vector array creation', () => {
  it('passes typechecking', () => {
    let vec2d: Vector2d = UNIT2D;
    let vec3d: Vector3d = UNIT3D;

    use(vec2d, vec3d);

    // 2D vector OK
    vec2d = [0, 0, 0] as Vector2d; // OK
    vec2d = [-0, NaN, -Infinity] as Vector2d; // IEEE 754 values are OK

    // 3D vector OK
    vec3d = [0, 0, 0, 0] as Vector3d;
    vec3d = [100, -0, Infinity, NaN] as Vector3d;

    // 2D vector not OK

    // @ts-expect-error not even an array
    vec2d = 3;
    // @ts-expect-error no elements
    vec2d = [] as Vector2d;
    // @ts-expect-error too few elements
    vec2d = [0, 0] as Vector2d;
    // @ts-expect-error too many elements
    vec2d = [0, 0, 0, 0] as Vector2d;

    // 3D vector not OK

    // @ts-expect-error not even an array
    vec3d = 3;
    // @ts-expect-error no elements
    vec3d = [] as Vector3d;
    // @ts-expect-error too few elements
    vec3d = [0, 0, 0] as Vector3d;
    // @ts-expect-error too many elements
    vec3d = [0, 0, 0, 0, 0] as Vector3d;
  });
});

describe('matrix array creation', () => {
  it('passes typechecking', () => {
    let mat2d: TransformMatrix2d = UNITMATRIX2D;
    let mat3d: TransformMatrix3d = NANMATRIX3D;

    use(mat2d, mat3d);

    // 2D matrix OK
    mat2d = [0, 1, 2, 3, 4, 5, 6, 7, 8] as TransformMatrix2d; // OK
    mat2d = [-0, NaN, -Infinity, 3, 4, 5, 6, 7, 8] as TransformMatrix2d; // IEEE 754 values are OK

    // 3D matrix OK
    mat3d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as TransformMatrix3d;
    mat3d = [100, -0, Infinity, NaN, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as TransformMatrix3d;

    // 2D matrix not OK

    // @ts-expect-error not even an array
    mat2d = 3;
    // @ts-expect-error no elements
    mat2d = [] as TransformMatrix2d;
    // @ts-expect-error too few elements
    mat2d = [0, 1, 2, 3, 4, 5, 6, 7] as TransformMatrix2d;
    // @ts-expect-error too many elements
    mat2d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as TransformMatrix2d;

    // 3D vector not OK

    // @ts-expect-error not even an array
    mat3d = 3;
    // @ts-expect-error no elements
    mat3d = [] as TransformMatrix3d;
    // @ts-expect-error too few elements
    mat3d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as TransformMatrix3d;
    // @ts-expect-error too many elements
    mat3d = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] as TransformMatrix3d;

    // @ts-expect-error Matrix modification is NOT OK
    mat3d[3] = 100;
  });
});

describe('matrix addition', () => {
  it('passes typecheck', () => {
    const mat2d: TransformMatrix2d = UNITMATRIX2D;
    const mat3d: TransformMatrix3d = NANMATRIX3D;

    add2d(mat2d, mat2d); // OK
    add3d(mat3d, mat3d); // OK

    // @ts-expect-error at least one arg doesn't comply
    add2d(mat2d, mat3d);
    // @ts-expect-error at least one arg doesn't comply
    add2d(mat3d, mat2d);
    // @ts-expect-error at least one arg doesn't comply
    add2d(mat3d, mat3d);
    // @ts-expect-error at least one arg doesn't comply
    add3d(mat2d, mat3d);
    // @ts-expect-error at least one arg doesn't comply
    add3d(mat3d, mat2d);
    // @ts-expect-error at least one arg doesn't comply
    add3d(mat2d, mat2d);
  });
});

describe('matric vector multiplication', () => {
  it('passes typecheck', () => {
    const vec2d: Vector2d = UNIT2D;
    const mat2d: TransformMatrix2d = UNITMATRIX2D;
    const vec3d: Vector3d = UNIT3D;
    const mat3d: TransformMatrix3d = NANMATRIX3D;

    mult2d(mat2d, vec2d); // OK
    mult3d(mat3d, vec3d); // OK

    // @ts-expect-error trying to use a 3d fun for 2d args
    mult3d(mat2d, vec2d);
    // @ts-expect-error trying to use a 2d fun for 3d args
    mult2d(mat3d, vec3d);

    // @ts-expect-error 1st arg is a mismatch
    mult2d(mat3d, vec2d);
    // @ts-expect-error 2nd arg is a mismatch
    mult2d(mat2d, vec3d);

    // @ts-expect-error 1st arg is a mismatch
    mult3d(mat2d, vec3d);
    // @ts-expect-error 2nd arg is a mismatch
    mult3d(mat3d, vec2d);
  });
});

describe('json', () => {
  it('passes typecheck', () => {
    let plain: Json = null;

    use(plain);

    // numbers are OK
    plain = 1;
    plain = NaN;
    plain = Infinity;
    plain = -Infinity;
    plain = Math.pow(2, 6);
    // other JSON primitive types are OK
    plain = false;
    plain = 'hello';
    plain = null;
    // structures made of above and of structures are OK
    plain = {};
    plain = [];
    plain = { a: 1 };
    plain = [0, null, false, NaN, 3.14, 'one more'];
    plain = { a: { b: 5, c: { d: [1, 'a', -Infinity, null], e: -1 }, f: 'b' }, g: false };

    // @ts-expect-error it's undefined
    plain = undefined;
    // @ts-expect-error it's a function
    plain = (a) => a;
    // @ts-expect-error it's a time
    plain = [new Date()];
    // @ts-expect-error symbol isn't permitted either
    plain = { a: Symbol('haha') };
    // @ts-expect-error can only guess what I wanted to check with this
    plain = window || undefined;
    // @ts-expect-error going deep into the structure
    plain = { a: { b: 5, c: { d: [1, 'a', undefined, null] } } };
  });
});

describe('select', () => {
  it('passes typecheck', () => {
    let selector: Selector;

    selector = select((a: Json) => a); // one arg
    selector = select((a: Json, b: Json): Json => `${a} and ${b}`); // more args
    selector = select(() => 1); // zero arg
    selector = select((...args: Json[]) => args); // variadic

    // @ts-expect-error not a selector
    selector = (a: Json) => a;
    // @ts-expect-error should yield a JSON value, but it returns void
    selector = select(() => {});
    // @ts-expect-error should return a Json
    selector = select((x: Json) => ({ a: x, b: undefined }));

    use(selector);
  });
});
