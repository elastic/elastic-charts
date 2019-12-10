import {
  getCustomSequentialPalette,
  getSequentialPalette,
  getCategoricalPalette,
  getDivergingPalette,
} from './color_palette';
import * as d3ScaleChromatic from 'd3-scale-chromatic';

describe('ColorPalette', () => {
  describe('categorical', () => {
    it('default accent palette', () => {
      const expected = ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'];
      expect(getCategoricalPalette('accent')).toEqual(expected);
    });

    it('falls back to default categorical palette if invalid name supplied', () => {
      // @ts-ignore
      expect(getCategoricalPalette('nonExistent')).toEqual(d3ScaleChromatic.schemeCategory10);
    });
  });

  describe('sequential color scale', () => {
    describe('greens', () => {
      const name = 'greens';
      it('calculates palette with 10 steps', () => {
        const expected = [
          '#f7fcf5',
          '#e6f5e1',
          '#cdebc7',
          '#addea7',
          '#88cd87',
          '#5db96b',
          '#38a055',
          '#1b843f',
          '#04672b',
          '#00441b',
        ];
        expect(getSequentialPalette(name, 10)).toEqual(expected);
      });
      it('calculates palette with 3 steps', () => {
        const expected = ['#f7fcf5', '#73c378', '#00441b'];
        expect(getSequentialPalette(name, 3)).toEqual(expected);
      });
      it('calculates greens palette with 5 steps', () => {
        const expected = ['#f7fcf5', '#c6e8bf', '#73c378', '#228b45', '#00441b'];
        expect(getSequentialPalette(name, 5)).toEqual(expected);
      });
    });
    describe('reds', () => {
      const name = 'reds';
      it('calculates palette with 10 steps', () => {
        const expected = [
          '#fff5f0',
          '#fee0d3',
          '#fdc3ac',
          '#fca082',
          '#fb7c5c',
          '#f5553d',
          '#e23028',
          '#c2181c',
          '#9b0d14',
          '#67000d',
        ];
        expect(getSequentialPalette(name, 10)).toEqual(expected);
      });
      it('calculates palette with 3 steps', () => {
        const expected = ['#fff5f0', '#f9694c', '#67000d'];
        expect(getSequentialPalette(name, 3)).toEqual(expected);
      });

      it('calculates greens palette with 5 steps', () => {
        const expected = ['#fff5f0', '#fcbaa1', '#f9694c', '#cb1c1e', '#67000d'];
        expect(getSequentialPalette(name, 5)).toEqual(expected);
      });
    });
    describe('custom', () => {
      it('creates a custom palette with 2 colors', () => {
        const expected = [
          '#dcedff',
          '#c0ccde',
          '#a4acbd',
          '#898c9e',
          '#6f6e80',
          '#565163',
          '#3f3647',
          '#281d2d',
          '#140016',
          '#000000',
        ];
        expect(getCustomSequentialPalette(['#AABBCC', '#221122'], 10)).toEqual(expected);
      });

      it('creates a custom palette with 2 different colors', () => {
        const expected = [
          '#65a8ff',
          '#87aaff',
          '#9cadf5',
          '#abafd5',
          '#b6b2b5',
          '#beb595',
          '#c3b874',
          '#c6bc50',
          '#c8bf19',
          '#c9c200',
        ];
        expect(getCustomSequentialPalette(['#007AFF', '#FFF500'], 10)).toEqual(expected);
      });
    });
    describe('multi-hue', () => {
      it('calculates RdPu palette with 10 steps', () => {
        const expected = [
          '#fff7f3',
          '#fde2df',
          '#fccac8',
          '#fbabb8',
          '#f880aa',
          '#ea519d',
          '#cc238e',
          '#a2057e',
          '#750175',
          '#49006a',
        ];
        expect(getSequentialPalette('RdPu', 10)).toEqual(expected);
      });

      it('calculates GnBu palette with 10 steps', () => {
        const expected = [
          '#f7fcf0',
          '#e3f4dd',
          '#cfecca',
          '#b3e1bc',
          '#8fd3be',
          '#67c0ca',
          '#43a5ca',
          '#2384ba',
          '#0c63a4',
          '#084081',
        ];
        expect(getSequentialPalette('GnBu', 10)).toEqual(expected);
      });
    });
    it('throws if invalid palette specified', () => {
      expect(() => {
        // @ts-ignore
        getSequentialPalette('nonExistentName', 5);
      }).toThrow();
    });
  });

  describe('diverging color scale', () => {
    it('calculates diverging palette with RdYlGn interpolator for a given number of steps', () => {
      const expected = [
        '#a50026',
        '#d8382d',
        '#f47c4a',
        '#fdbe70',
        '#feeda1',
        '#e9f5a1',
        '#b6e076',
        '#73c364',
        '#289b51',
        '#006837',
      ];
      expect(getDivergingPalette('RdYlGn', 10)).toEqual(expected);
    });
    it('calculates diverging palette with RdYlBu interpolator for a given number of steps', () => {
      const expected = [
        '#a50026',
        '#d8382d',
        '#f47c4a',
        '#fdbe72',
        '#feeda5',
        '#edf7dd',
        '#bce1ed',
        '#81b6d6',
        '#4d7ab7',
        '#313695',
      ];
      expect(getDivergingPalette('RdYlBu', 10)).toEqual(expected);
    });
  });
});
