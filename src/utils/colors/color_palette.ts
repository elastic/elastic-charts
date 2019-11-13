import { RGBArray, hexToRgb } from './hex_to_rgb';
import { ColorPalette } from '../../chart_types/xy_chart/utils/specs';

const DEFAULT_NUM_OF_STEPS = 10;
/**
 * Create the color object for manipulation by other functions
 */
class Color {
  collection: RGBArray;
  text: string;

  constructor(public r: number, public g: number, public b: number) {
    this.collection = [r, g, b];
    this.text = createHex(this.collection);
  }
}

interface Palette {
  steps: number;
  calcPalette(): string[];
}

export class SequentialPalette implements Palette {
  startColor: string;
  endColor: string;
  steps: number;

  constructor(colors: string[], steps?: number) {
    if (colors.length !== 2) {
      throw new Error('Valid number of colors for sequential palette is 1 or 2');
    }
    if (steps && steps <= 1) {
      throw new Error('Miminum number of steps is 2');
    }
    this.startColor = colors[0];
    this.endColor = colors.length === 2 ? colors[1] : this.startColor;
    this.steps = steps || DEFAULT_NUM_OF_STEPS;
  }

  calcPalette(): string[] {
    if (!isHex(this.startColor) || !isHex(this.endColor)) {
      throw new Error('Please provide two valid hex color codes.');
    }
    const count = this.steps - 1;
    const colorArray: Color[] = [];
    const hexPalette: string[] = [];
    const startHex = hexToRgb(this.startColor); // get RGB equivalent values as array
    const endHex = hexToRgb(this.endColor); // get RGB equivalent values as array
    colorArray[0] = new Color(startHex[0], startHex[1], startHex[2]); // create first color obj
    colorArray[count] = new Color(endHex[0], endHex[1], endHex[2]); // create last color obj
    const step = stepCalc(count, colorArray[0], colorArray[count]); // create array of step increments
    // build the color palette array
    hexPalette.push(colorArray[0].text); // set the first color in the array
    for (let i = 1; i < count; i++) {
      // set the intermediate colors in the array
      const r = colorArray[0].r + step[0] * i;
      const g = colorArray[0].g + step[1] * i;
      const b = colorArray[0].b + step[2] * i;
      colorArray[i] = new Color(r, g, b);
      hexPalette[i] = colorArray[i].text;
    } // all the colors in between
    hexPalette[count] = colorArray[count].text; // set the last color in the array

    return hexPalette;
  }
}

export class DivergingPalette implements Palette {
  startColor: string;
  middleColor: string;
  endColor: string;
  steps: number;

  constructor(colors: string[], steps?: number) {
    if (colors.length !== 3) {
      throw new Error('Valid number of colors for diverging palette is 3');
    }
    this.startColor = colors[0];
    this.middleColor = colors[1];
    this.endColor = colors[2];
    this.steps = steps || DEFAULT_NUM_OF_STEPS;
  }

  calcPalette(): string[] {
    //TBD
    return [];
  }
}

export class QualitativePalette implements Palette {
  colors: string[];
  steps: number;

  constructor(colors: string[], steps?: number) {
    this.colors = colors;
    this.steps = steps || DEFAULT_NUM_OF_STEPS;
  }

  calcPalette(): string[] {
    //TBD
    return [];
  }
}

/**
 * This function takes a color palette name and returns an array of hex color
 * codes for use in UI elements such as charts.
 *
 * @returns {Array} Returns an array of hexadecimal color codes
 * @param colorPalette
 */

export function calcColorPalette(colorPalette: ColorPalette) {
  const { colors, steps, type } = colorPalette;
  if (type === 'sequential') {
    return new SequentialPalette(colors, steps).calcPalette();
  } else if (type === 'diverging') {
    return new DivergingPalette(colors, steps).calcPalette();
  } else {
    return new QualitativePalette(colors, steps).calcPalette();
  }
}

/**
 * Check if argument is a valid 3 or 6 character hexadecimal color code
 */
function isHex(value: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
}

/**
 * Calculate and construct the hexadecimal color code from RGB values
 */
function createHex(rgbValues: RGBArray): string {
  let result = '';
  let val = 0;
  let piece;
  const base = 16;
  for (let k = 0; k < 3; k++) {
    val = Math.round(rgbValues[k]);
    piece = val.toString(base); // Converts to radix 16 based value (0-9, A-F)
    if (piece.length < 2) {
      piece = `0${piece}`;
    }
    result = result + piece;
  }
  result = `#${result.toUpperCase()}`; // Return in #RRGGBB format
  return result;
}

/**
 * Calculate the step increment for each piece of the hexadecimal color code
 */
function stepCalc(steps: number, startColor: Color, endColor: Color): RGBArray {
  const step: RGBArray = [
    (endColor.r - startColor.r) / steps, // Calc step amount for red value
    (endColor.g - startColor.g) / steps, // Calc step amount for green value
    (endColor.b - startColor.b) / steps, // Calc step amount for blue value
  ];

  return step;
}
