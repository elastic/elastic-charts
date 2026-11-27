/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

// SPIKE: `renderToStaticMarkup` for the shim: one walk over the element tree, no state, no effects.
// The attribute and style rules follow what react-dom/server 18 writes, so the two outputs can be compared.
import { CONTEXT, ELEMENT, FORWARD_REF, Fragment, MEMO, PROVIDER, StrictMode, Suspense } from './react';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
const escape = (text: unknown) => String(text).replaceAll(/["&'<>]/g, (c) => ESCAPES[c]!);

const VOID = new Set('area base br col embed hr img input keygen link meta param source track wbr'.split(' '));
const SKIPPED = new Set(
  'children dangerouslySetInnerHTML suppressContentEditableWarning suppressHydrationWarning defaultValue defaultChecked innerHTML key ref'.split(
    ' ',
  ),
);
const BOOLEAN = new Set(
  'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope checked multiple muted selected'.split(
    ' ',
  ),
);
const BOOLEANISH = new Set(
  'contentEditable draggable spellCheck value autoReverse externalResourcesRequired focusable preserveAlpha'.split(' '),
);
const LOWERCASED = new Set('contentEditable draggable spellCheck tabIndex crossOrigin rowSpan'.split(' '));
const RENAMED: Record<string, string> = {
  className: 'class',
  htmlFor: 'for',
  acceptCharset: 'accept-charset',
  httpEquiv: 'http-equiv',
  xlinkHref: 'xlink:href',
  xmlSpace: 'xml:space',
  xmlLang: 'xml:lang',
};
// the camelCase SVG presentation attributes that react-dom writes hyphenated; the rest keep their case (viewBox)
const HYPHENATED = new Set(
  'accentHeight alignmentBaseline arabicForm baselineShift capHeight clipPath clipRule colorInterpolation colorInterpolationFilters colorProfile colorRendering dominantBaseline enableBackground fillOpacity fillRule floodColor floodOpacity fontFamily fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontWeight glyphName glyphOrientationHorizontal glyphOrientationVertical horizAdvX horizOriginX imageRendering letterSpacing lightingColor markerEnd markerMid markerStart overlinePosition overlineThickness paintOrder panose1 pointerEvents renderingIntent shapeRendering stopColor stopOpacity strikethroughPosition strikethroughThickness strokeDasharray strokeDashoffset strokeLinecap strokeLinejoin strokeMiterlimit strokeOpacity strokeWidth textAnchor textDecoration textRendering transformOrigin underlinePosition underlineThickness unicodeBidi unicodeRange unitsPerEm vAlphabetic vHanging vIdeographic vMathematical vectorEffect vertAdvY vertOriginX vertOriginY wordSpacing writingMode xHeight'.split(
    ' ',
  ),
);
const UNITLESS = new Set(
  'animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth'.split(
    ' ',
  ),
);
// a vendor prefix does not change whether a property takes a unit
const unitless = (name: string) =>
  UNITLESS.has(name) || UNITLESS.has(name.replace(/^(Webkit|Moz|ms|O)([A-Z])/, (_, __, c) => c.toLowerCase()));
const hyphenate = (name: string) => name.replaceAll(/[A-Z]/g, (c) => `-${c.toLowerCase()}`).replace(/^ms-/, '-ms-');

function style(value: Record<string, unknown>) {
  const parts: string[] = [];
  for (const name in value) {
    const v = value[name];
    if (v == null || typeof v === 'boolean' || v === '') continue;
    if (name.startsWith('--')) parts.push(`${escape(name)}:${escape(String(v).trim())}`);
    else {
      const text = typeof v === 'number' ? (v !== 0 && !unitless(name) ? `${v}px` : `${v}`) : escape(String(v).trim());
      parts.push(`${hyphenate(name)}:${text}`);
    }
  }
  return parts.length > 0 ? ` style="${parts.join(';')}"` : '';
}

function attribute(name: string, value: unknown): string {
  if (SKIPPED.has(name) || value == null || typeof value === 'function' || typeof value === 'symbol') return '';
  if (name === 'style') return style(value as Record<string, unknown>);
  if (name.length > 2 && /^on/i.test(name)) return '';
  if (BOOLEAN.has(name)) return value ? ` ${name.toLowerCase()}=""` : '';
  const dataOrAria = /^(data|aria)-/.test(name);
  if (typeof value === 'boolean' && !dataOrAria && !BOOLEANISH.has(name)) return '';
  const written =
    RENAMED[name] ?? (HYPHENATED.has(name) ? hyphenate(name) : LOWERCASED.has(name) ? name.toLowerCase() : name);
  return ` ${written}="${escape(value)}"`;
}

function host(tag: string, props: Record<string, any>, out: string[]) {
  out.push(`<${tag}`);
  for (const name in props) out.push(attribute(name, props[name]));
  if (VOID.has(tag)) {
    out.push('/>');
    return;
  }
  out.push('>');
  const html = props.dangerouslySetInnerHTML?.__html;
  if (html != null) out.push(html);
  else node(props.children, out);
  out.push(`</${tag}>`);
}

function node(n: any, out: string[]): void {
  if (n == null || typeof n === 'boolean' || typeof n === 'function') return;
  if (typeof n === 'string' || typeof n === 'number') {
    out.push(escape(n));
    return;
  }
  if (Array.isArray(n)) {
    for (const child of n) node(child, out);
    return;
  }
  if (n.$$typeof !== ELEMENT) throw new Error(`Objects are not valid as a child: ${Object.keys(n).join(', ')}`);
  const { type, props } = n;
  if (typeof type === 'string') return host(type, props, out);
  if (type === Fragment || type === Suspense || type === StrictMode) return node(props.children, out);
  if (typeof type === 'function') {
    if (type.prototype?.isReactComponent) {
      const context = type.contextType?.current;
      const instance = new type(props, context);
      instance.props = props;
      instance.context = context;
      if (type.getDerivedStateFromProps) {
        instance.state = { ...instance.state, ...type.getDerivedStateFromProps(props, instance.state) };
      }
      return node(instance.render(), out);
    }
    return node(type(props), out);
  }
  switch (type?.$$typeof) {
    case MEMO:
      return node({ ...n, type: type.type }, out);
    case FORWARD_REF:
      return node(type.render(props, n.ref), out);
    case PROVIDER: {
      const { context } = type;
      const outer = context.current;
      context.current = props.value;
      try {
        return node(props.children, out);
      } finally {
        context.current = outer;
      }
    }
    case CONTEXT:
      return node(props.children(type.current), out);
    default:
      throw new Error(`Unsupported element type: ${String(type?.$$typeof ?? type)}`);
  }
}

export function renderToStaticMarkup(element: unknown): string {
  const out: string[] = [];
  node(element, out);
  return out.join('');
}
export const renderToString = renderToStaticMarkup;
