/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { useEffect, useState } from 'react';

interface UseFontFaceReadyOptions {
  sampleText?: string;
  weights?: ReadonlyArray<number | string>;
}

const DEFAULT_SAMPLE_TEXT = '0123456789%.,()$+-−AaBb';
const DEFAULT_FONT_WEIGHTS = ['400', '700'] as const;

function supportsFontLoadingApi() {
  return typeof document !== 'undefined' && 'fonts' in document;
}

function getFontDescriptor(fontFamily: string, fontWeight: number | string) {
  return `normal ${fontWeight} 16px ${fontFamily}`;
}

function isFontFaceReady(fontFamily: string, sampleText: string, fontWeights: ReadonlyArray<number | string>) {
  if (!supportsFontLoadingApi()) {
    return true;
  }

  return fontWeights.every((fontWeight) => document.fonts.check(getFontDescriptor(fontFamily, fontWeight), sampleText));
}

/**
 * Utilizes `document.fonts.check` and `document.fonts.load` browser APIs to ensure
 * that the font is loaded and ready to use.
 */
export function useFontFaceReady(
  fontFamily: string | null,
  { sampleText = DEFAULT_SAMPLE_TEXT, weights = DEFAULT_FONT_WEIGHTS }: UseFontFaceReadyOptions = {},
) {
  const [ready, setReady] = useState(() =>
    fontFamily === null ? true : isFontFaceReady(fontFamily, sampleText, weights),
  );

  useEffect(() => {
    if (fontFamily === null || !supportsFontLoadingApi()) {
      setReady(true);
      return;
    }

    if (isFontFaceReady(fontFamily, sampleText, weights)) {
      setReady(true);
      return;
    }

    setReady(false);

    let cancelled = false;
    void Promise.allSettled(
      weights.map((fontWeight) => document.fonts.load(getFontDescriptor(fontFamily, fontWeight), sampleText)),
    ).then(() => {
      if (cancelled) {
        return undefined;
      }

      setReady(isFontFaceReady(fontFamily, sampleText, weights));
      return undefined;
    });

    return () => {
      cancelled = true;
    };
  }, [fontFamily, sampleText, weights]);

  return ready;
}
