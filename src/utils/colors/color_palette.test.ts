import {
  getCustomSequentialPalette,
  getCustomCategoricalPalette,
  getSequentialPalette,
  getCyclicalPalette,
  getCategoricalPalette,
  getDivergingPalette,
} from './color_palette';

describe('ColorPalette', () => {
  describe('categorical', () => {
    it('euiPalette', () => {
      const expected = [
        '#1ea593',
        '#2b70f7',
        '#ce0060',
        '#38007e',
        '#fca5d3',
        '#f37020',
        '#e49e29',
        '#b0916F',
        '#7b000b',
        '#34130c',
      ];
      expect(getCategoricalPalette('euiPaletteColorBlind')).toEqual(expected);
    });

    it('default accent palette', () => {
      const expected = ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'];
      expect(getCategoricalPalette('accent')).toEqual(expected);
    });

    it('custom palette with two different colors', () => {
      const expected = [
        '#007aff',
        '#9072ff',
        '#d566f4',
        '#ff58da',
        '#ff56b7',
        '#ff6990',
        '#ff8969',
        '#ffae43',
        '#ffd317',
        '#fff500',
      ];
      expect(getCustomCategoricalPalette(['#007AFF', '#FFF500'], 10)).toEqual(expected);
    });

    it('calculates custom palette with two similar colors', () => {
      const expected = [
        '#aabbcc',
        '#98a6b9',
        '#8891a5',
        '#787d92',
        '#68697f',
        '#59566c',
        '#4b4459',
        '#3d3246',
        '#2f2134',
        '#221122',
      ];
      expect(getCustomCategoricalPalette(['#AABBCC', '#221122'], 10)).toEqual(expected);
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
          '#c1d0df',
          '#a6b3c0',
          '#8d97a2',
          '#747c85',
          '#5c6269',
          '#454a4e',
          '#2f3235',
          '#1b1c1e',
          '#000000',
        ];
        expect(getCustomSequentialPalette(['#AABBCC', '#221122'], 10)).toEqual(expected);
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
  });

  describe('cyclical color scale', () => {
    it('calculates cyclical palette for a given number of steps', () => {
      const expected = [
        '#6e40aa',
        '#bf3caf',
        '#fe4b83',
        '#ff7847',
        '#e2b72f',
        '#aff05b',
        '#52f667',
        '#1ddfa3',
        '#23abd8',
        '#4c6edb',
      ];
      expect(getCyclicalPalette(10)).toEqual(expected);
    });

    it('throws error if number of steps less or equal than zero', () => {
      expect(() => {
        getCyclicalPalette(-2);
      }).toThrow();
    });
  });

  describe('diverging color scale', () => {
    it('calculates diverging palette for a given number of steps', () => {
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
      expect(getDivergingPalette(10)).toEqual(expected);
    });
  });
});
