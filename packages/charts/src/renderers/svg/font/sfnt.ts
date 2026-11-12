/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * The horizontal metrics of one font face, read from a TrueType or OpenType file: what text
 * measurement needs, in font units.
 * @internal
 */
export interface FontFaceMetrics {
  /** the family and full names the face is known by */
  names: string[];
  weight: number;
  italic: boolean;
  unitsPerEm: number;
  /** above the baseline, positive */
  ascent: number;
  /** below the baseline, positive */
  descent: number;
  /** the typographic ascender and descender (positive), which canvas normalizes to the em box */
  typoAscent: number;
  typoDescent: number;
  capHeight: number;
  /** 0, the missing glyph, when the face has no glyph for the code point */
  glyphIndex: (codePoint: number) => number;
  advance: (glyph: number) => number;
  /** the horizontal adjustment between two adjacent glyphs, from `GPOS` or `kern` */
  kerning: (left: number, right: number) => number;
}

type Tables = Map<string, DataView>;

const tag = (view: DataView, offset: number) =>
  String.fromCharCode(
    view.getUint8(offset),
    view.getUint8(offset + 1),
    view.getUint8(offset + 2),
    view.getUint8(offset + 3),
  );

/**
 * Parses the faces of a `.ttf`, `.otf` or `.ttc` file. WOFF files are compressed and must be
 * decompressed to their sfnt first.
 * @internal
 */
export function parseFontFile(data: ArrayBuffer | ArrayBufferView): FontFaceMetrics[] {
  const view = ArrayBuffer.isView(data)
    ? new DataView(data.buffer, data.byteOffset, data.byteLength)
    : new DataView(data);
  const signature = tag(view, 0);
  if (signature === 'ttcf') {
    const count = view.getUint32(8);
    return Array.from({ length: count }, (_, i) => parseFace(view, view.getUint32(12 + i * 4)));
  }
  if (signature === 'wOFF' || signature === 'wOF2') {
    throw new Error('WOFF fonts are compressed: register the .ttf or .otf file');
  }
  return [parseFace(view, 0)];
}

function parseFace(view: DataView, start: number): FontFaceMetrics {
  const tables: Tables = new Map();
  const numTables = view.getUint16(start + 4);
  for (let i = 0; i < numTables; i++) {
    const record = start + 12 + i * 16;
    const offset = view.getUint32(record + 8);
    const length = view.getUint32(record + 12);
    tables.set(tag(view, record), new DataView(view.buffer, view.byteOffset + offset, length));
  }
  const table = (name: string) => {
    const found = tables.get(name);
    if (!found) throw new Error(`font has no ${name} table`);
    return found;
  };

  const unitsPerEm = table('head').getUint16(18);
  const hhea = table('hhea');
  const os2 = tables.get('OS/2');
  const numberOfHMetrics = hhea.getUint16(34);
  const hmtx = table('hmtx');
  const lastAdvance = hmtx.getUint16((numberOfHMetrics - 1) * 4);
  const advance = (glyph: number) => (glyph < numberOfHMetrics ? hmtx.getUint16(glyph * 4) : lastAdvance);

  const fsSelection = os2 ? os2.getUint16(62) : 0;
  const names = readNames(table('name'));
  const subfamily = names.subfamily.toLowerCase();

  return {
    names: [...new Set([names.typographicFamily, names.family, names.fullName].filter(Boolean))],
    weight: os2 ? os2.getUint16(4) : subfamily.includes('bold') ? 700 : 400,
    // bit 0 italic, bit 9 oblique
    italic: (fsSelection & 0x201) !== 0 || /italic|oblique/.test(subfamily),
    unitsPerEm,
    ascent: hhea.getInt16(4),
    descent: -hhea.getInt16(6),
    typoAscent: os2 ? os2.getInt16(68) : hhea.getInt16(4),
    typoDescent: os2 ? -os2.getInt16(70) : -hhea.getInt16(6),
    capHeight: os2 && os2.getUint16(0) >= 2 && os2.byteLength > 89 ? os2.getInt16(88) : hhea.getInt16(4) * 0.7,
    glyphIndex: readCmap(table('cmap')),
    advance,
    kerning: readKerning(tables),
  };
}

function readNames(name: DataView) {
  const count = name.getUint16(2);
  const stringOffset = name.getUint16(4);
  const found = new Map<number, { score: number; value: string }>();
  for (let i = 0; i < count; i++) {
    const record = 6 + i * 12;
    const platform = name.getUint16(record);
    const language = name.getUint16(record + 4);
    const nameId = name.getUint16(record + 6);
    const length = name.getUint16(record + 8);
    const offset = stringOffset + name.getUint16(record + 10);
    if (![1, 2, 4, 16].includes(nameId)) continue;
    // windows English first, then any unicode record, then macintosh roman
    const score = platform === 3 ? (language === 0x409 ? 3 : 2) : platform === 0 ? 2 : 1;
    if ((found.get(nameId)?.score ?? 0) >= score) continue;
    let value = '';
    if (platform === 1) {
      for (let k = 0; k < length; k++) value += String.fromCharCode(name.getUint8(offset + k));
    } else {
      for (let k = 0; k + 1 < length; k += 2) value += String.fromCharCode(name.getUint16(offset + k));
    }
    found.set(nameId, { score, value });
  }
  const get = (id: number) => found.get(id)?.value ?? '';
  return { family: get(1), subfamily: get(2), fullName: get(4), typographicFamily: get(16) };
}

function readCmap(cmap: DataView): (codePoint: number) => number {
  const count = cmap.getUint16(2);
  const subtables: Array<{ platform: number; encoding: number; offset: number; format: number }> = [];
  for (let i = 0; i < count; i++) {
    const record = 4 + i * 8;
    const offset = cmap.getUint32(record + 4);
    subtables.push({
      platform: cmap.getUint16(record),
      encoding: cmap.getUint16(record + 2),
      offset,
      format: cmap.getUint16(offset),
    });
  }
  const full = subtables.find(({ format }) => format === 12);
  if (full) return cmapFormat12(cmap, full.offset);
  const bmp = subtables.find(({ format, platform }) => format === 4 && (platform === 3 || platform === 0));
  if (bmp) return cmapFormat4(cmap, bmp.offset);
  return () => 0;
}

function cmapFormat12(cmap: DataView, offset: number) {
  const groups = cmap.getUint32(offset + 12);
  return (codePoint: number) => {
    let [low, high] = [0, groups - 1];
    while (low <= high) {
      const mid = (low + high) >> 1;
      const group = offset + 16 + mid * 12;
      if (codePoint < cmap.getUint32(group)) high = mid - 1;
      else if (codePoint > cmap.getUint32(group + 4)) low = mid + 1;
      else return cmap.getUint32(group + 8) + codePoint - cmap.getUint32(group);
    }
    return 0;
  };
}

function cmapFormat4(cmap: DataView, offset: number) {
  const segCount = cmap.getUint16(offset + 6) / 2;
  const endCodes = offset + 14;
  const startCodes = endCodes + segCount * 2 + 2;
  const idDeltas = startCodes + segCount * 2;
  const idRangeOffsets = idDeltas + segCount * 2;
  return (codePoint: number) => {
    if (codePoint > 0xffff) return 0;
    let [low, high] = [0, segCount - 1];
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (codePoint > cmap.getUint16(endCodes + mid * 2)) low = mid + 1;
      else if (mid > 0 && codePoint <= cmap.getUint16(endCodes + (mid - 1) * 2)) high = mid - 1;
      else {
        if (codePoint < cmap.getUint16(startCodes + mid * 2)) return 0;
        const delta = cmap.getInt16(idDeltas + mid * 2);
        const rangeOffset = cmap.getUint16(idRangeOffsets + mid * 2);
        if (rangeOffset === 0) return (codePoint + delta) & 0xffff;
        const glyphAddress =
          idRangeOffsets + mid * 2 + rangeOffset + (codePoint - cmap.getUint16(startCodes + mid * 2)) * 2;
        const glyph = cmap.getUint16(glyphAddress);
        return glyph === 0 ? 0 : (glyph + delta) & 0xffff;
      }
    }
    return 0;
  };
}

function readKerning(tables: Tables): (left: number, right: number) => number {
  const gpos = tables.get('GPOS');
  const pairs = gpos ? gposKerning(gpos) : [];
  const kern = tables.get('kern');
  const legacy = pairs.length === 0 && kern ? kernTable(kern) : undefined;
  const cache = new Map<number, number>();
  return (left, right) => {
    const key = left * 65536 + right;
    let value = cache.get(key);
    if (value === undefined) {
      value = legacy ? legacy.get(key) ?? 0 : pairs.reduce((sum, lookup) => sum + lookup(left, right), 0);
      cache.set(key, value);
    }
    return value;
  };
}

/** the format 0 subtables of the legacy `kern` table */
function kernTable(kern: DataView): Map<number, number> {
  const pairs = new Map<number, number>();
  if (kern.getUint16(0) !== 0) return pairs;
  let offset = 4;
  for (let t = kern.getUint16(2); t > 0; t--) {
    const length = kern.getUint16(offset + 2);
    const coverage = kern.getUint16(offset + 4);
    if (coverage >> 8 === 0 && (coverage & 1) === 1) {
      const nPairs = kern.getUint16(offset + 6);
      for (let i = 0; i < nPairs; i++) {
        const pair = offset + 14 + i * 6;
        pairs.set(kern.getUint16(pair) * 65536 + kern.getUint16(pair + 2), kern.getInt16(pair + 4));
      }
    }
    offset += length;
  }
  return pairs;
}

type PairLookup = (left: number, right: number) => number;

/** the feature indices of the default language of the Latin script, or else of the default script */
function latinFeatureIndices(gpos: DataView): number[] | undefined {
  const scriptList = gpos.getUint16(4);
  const scripts = new Map<string, number>();
  for (let i = 0, count = gpos.getUint16(scriptList); i < count; i++) {
    const record = scriptList + 2 + i * 6;
    scripts.set(tag(gpos, record), scriptList + gpos.getUint16(record + 4));
  }
  const script = scripts.get('latn') ?? scripts.get('DFLT');
  if (script === undefined) return undefined;
  const defaultLangSys = gpos.getUint16(script);
  if (defaultLangSys === 0) return undefined;
  const langSys = script + defaultLangSys;
  return Array.from({ length: gpos.getUint16(langSys + 4) }, (_, i) => gpos.getUint16(langSys + 6 + i * 2));
}

/**
 * The lookups of the `kern` feature that shaping Latin text applies, each the first of its pair
 * adjustment subtables that covers the pair.
 */
function gposKerning(gpos: DataView): PairLookup[] {
  const featureList = gpos.getUint16(6);
  const lookupList = gpos.getUint16(8);
  const features = latinFeatureIndices(gpos);
  const lookupIndices = new Set<number>();
  for (let i = 0, count = gpos.getUint16(featureList); i < count; i++) {
    const record = featureList + 2 + i * 6;
    if (tag(gpos, record) !== 'kern' || (features && !features.includes(i))) continue;
    const feature = featureList + gpos.getUint16(record + 4);
    for (let k = 0, n = gpos.getUint16(feature + 2); k < n; k++) lookupIndices.add(gpos.getUint16(feature + 4 + k * 2));
  }
  return [...lookupIndices]
    .sort((a, b) => a - b)
    .map((index) => {
      const lookup = lookupList + gpos.getUint16(lookupList + 2 + index * 2);
      const type = gpos.getUint16(lookup);
      const subtables: PairLookup[] = [];
      for (let s = 0, n = gpos.getUint16(lookup + 4); s < n; s++) {
        let subtable = lookup + gpos.getUint16(lookup + 6 + s * 2);
        let subtableType = type;
        if (type === 9) {
          subtableType = gpos.getUint16(subtable + 2);
          subtable += gpos.getUint32(subtable + 4);
        }
        if (subtableType === 2) subtables.push(pairAdjustment(gpos, subtable));
      }
      return (left: number, right: number) => {
        for (const subtable of subtables) {
          const value = subtable(left, right);
          if (!Number.isNaN(value)) return value;
        }
        return 0;
      };
    });
}

const valueRecordSize = (format: number) => {
  let size = 0;
  for (let bits = format; bits > 0; bits >>= 1) size += (bits & 1) * 2;
  return size;
};

/** the x advance of the first glyph's value record, the one fonts kern with */
const xAdvance = (view: DataView, record: number, format: number) => {
  if ((format & 0x4) === 0) return 0;
  return view.getInt16(record + (format & 0x1 ? 2 : 0) + (format & 0x2 ? 2 : 0));
};

/** a pair adjustment subtable: `NaN` when it does not cover the first glyph */
function pairAdjustment(gpos: DataView, subtable: number): PairLookup {
  const format = gpos.getUint16(subtable);
  const coverage = readCoverage(gpos, subtable + gpos.getUint16(subtable + 2));
  const valueFormat1 = gpos.getUint16(subtable + 4);
  const valueFormat2 = gpos.getUint16(subtable + 6);
  const size1 = valueRecordSize(valueFormat1);
  const size2 = valueRecordSize(valueFormat2);

  if (format === 1) {
    return (left, right) => {
      const index = coverage(left);
      if (index < 0) return Number.NaN;
      const pairSet = subtable + gpos.getUint16(subtable + 10 + index * 2);
      const recordSize = 2 + size1 + size2;
      let [low, high] = [0, gpos.getUint16(pairSet) - 1];
      while (low <= high) {
        const mid = (low + high) >> 1;
        const record = pairSet + 2 + mid * recordSize;
        const second = gpos.getUint16(record);
        if (second < right) low = mid + 1;
        else if (second > right) high = mid - 1;
        else return xAdvance(gpos, record + 2, valueFormat1);
      }
      return Number.NaN;
    };
  }
  if (format === 2) {
    const classDef1 = readClassDef(gpos, subtable + gpos.getUint16(subtable + 8));
    const classDef2 = readClassDef(gpos, subtable + gpos.getUint16(subtable + 10));
    const class2Count = gpos.getUint16(subtable + 14);
    return (left, right) => {
      if (coverage(left) < 0) return Number.NaN;
      const record = subtable + 16 + (classDef1(left) * class2Count + classDef2(right)) * (size1 + size2);
      return xAdvance(gpos, record, valueFormat1);
    };
  }
  return () => Number.NaN;
}

/** the coverage index of a glyph, -1 when not covered */
function readCoverage(view: DataView, offset: number): (glyph: number) => number {
  const format = view.getUint16(offset);
  const count = view.getUint16(offset + 2);
  return (glyph) => {
    let [low, high] = [0, count - 1];
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (format === 1) {
        const value = view.getUint16(offset + 4 + mid * 2);
        if (value < glyph) low = mid + 1;
        else if (value > glyph) high = mid - 1;
        else return mid;
      } else {
        const range = offset + 4 + mid * 6;
        if (glyph < view.getUint16(range)) high = mid - 1;
        else if (glyph > view.getUint16(range + 2)) low = mid + 1;
        else return view.getUint16(range + 4) + glyph - view.getUint16(range);
      }
    }
    return -1;
  };
}

function readClassDef(view: DataView, offset: number): (glyph: number) => number {
  const format = view.getUint16(offset);
  if (format === 1) {
    const startGlyph = view.getUint16(offset + 2);
    const glyphCount = view.getUint16(offset + 4);
    return (glyph) =>
      glyph >= startGlyph && glyph < startGlyph + glyphCount
        ? view.getUint16(offset + 6 + (glyph - startGlyph) * 2)
        : 0;
  }
  const count = view.getUint16(offset + 2);
  return (glyph) => {
    let [low, high] = [0, count - 1];
    while (low <= high) {
      const mid = (low + high) >> 1;
      const range = offset + 4 + mid * 6;
      if (glyph < view.getUint16(range)) high = mid - 1;
      else if (glyph > view.getUint16(range + 2)) low = mid + 1;
      else return view.getUint16(range + 4);
    }
    return 0;
  };
}
