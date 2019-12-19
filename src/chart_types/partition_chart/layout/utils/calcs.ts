import { Ratio } from '../types/geometry_types';
import { RgbTuple } from './d3_utils';
import { ShapeTreeNode } from '../types/viewmodel_types';

export const getOpacity = (d: ShapeTreeNode) => [0, 0.8, 0.7, 0.6][d.depth];

export const cyclicalHueInterpolator = (colors: RgbTuple[]) => (d: number) => {
  // const cyclicalHueInterpolator = d3.interpolateRainbow
  const index = Math.round(d * 255);
  const [r, g, b] = colors[index];
  return `rgb(${r},${g},${b})`;
};

export const addOpacity = (hexColorString: string, opacity: Ratio) =>
  // this is a super imperfect multiplicative alpha blender that assumes a "#rrggbb" or "#rrggbbaa" hexColorString
  // todo roll some proper utility that can handle "rgb(...)", "rgba(...)", "red", {r, g, b} etc.
  opacity === 1
    ? hexColorString
    : hexColorString.slice(0, 7) +
      (hexColorString.slice(7).length === 0 || parseInt(hexColorString.slice(7, 2), 16) === 255
        ? ('00' + Math.round(opacity * 255).toString(16)).substr(-2) // color was of full opacity
        : ('00' + Math.round((parseInt(hexColorString.slice(7, 2), 16) / 255) * opacity * 255).toString(16)).substr(
            -2,
          ));

export const objectAssign = (target: object, ...sources: object[]) => {
  sources.forEach((source) => {
    Object.keys(source).forEach((key) => {
      // @ts-ignore
      const s = source[key];
      // @ts-ignore
      const t = target[key];
      // @ts-ignore
      target[key] = t && s && typeof t === 'object' && typeof s === 'object' ? objectAssign(t, s) : s;
    });
  });
  return target;
};

export const deepTween = (target: object, source: object, ratio: Ratio) => {
  Object.keys(source).forEach((key) => {
    // @ts-ignore
    const sVal = source[key];
    // @ts-ignore
    const tVal = target[key];
    // @ts-ignore
    target[key] =
      tVal && sVal && typeof tVal === 'object' && typeof sVal === 'object'
        ? deepTween(tVal, sVal, ratio)
        : typeof sVal === 'number' && typeof tVal === 'number'
        ? tVal + (sVal - tVal) * ratio
        : sVal;
  });
  return target;
};

export const arrayToLookup = (keyFun: Function, array: Array<any>) =>
  Object.assign({}, ...array.map((d) => ({ [keyFun(d)]: d })));
