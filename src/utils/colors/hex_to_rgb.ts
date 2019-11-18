export type RGBArray = [number, number, number];

export interface HSV {
  h: number;
  s: number;
  v: number;
}
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type HexColor = string;

// Convert hexadecimal color into an array of RGB integer values
// Modified from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function hexToRgb(hex: string): RGBArray {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullFormHex = hex.replace(shorthandRegex, (m, r1, g1, b1) => r1 + r1 + g1 + g1 + b1 + b1);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullFormHex);

  if (result) {
    const [, r, g, b] = result;
    return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
  }

  // fallback to prevent errors
  return [0, 0, 0];
}
