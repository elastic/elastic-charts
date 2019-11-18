import { SequentialPalette, calcColorPalette } from './color_palette';
import { ColorPalette } from '../../chart_types/xy_chart/utils/specs';

describe('ColorPalette', () => {
  describe('calculates appropriate color palette based on type', () => {
    test('sequential', () => {
      const colorPalette: ColorPalette = {
        colors: ['#FFFF6D', '#1EA593'],
        steps: 3,
        type: 'sequential',
      };
      const calculatedPalette = calcColorPalette(colorPalette);
      expect(calculatedPalette).toEqual(SequentialPalette.calcPalette(colorPalette.colors, colorPalette.steps));
    });
  });

  describe('sequential palette', () => {
    test('calculates hex palette with default step', () => {
      const calculatedPalette = SequentialPalette.calcPalette(['#FFFF6D', '#1EA593']);
      const expectedPalette = [
        '#FFFF6D',
        '#E6F571',
        '#CDEB75',
        '#B4E17A',
        '#9BD77E',
        '#82CD82',
        '#69C386',
        '#50B98B',
        '#37AF8F',
        '#1EA593',
      ];
      expect(calculatedPalette).toEqual(expectedPalette);
    });

    test('calculates hex palette with a given step', () => {
      const calculatedPalette = SequentialPalette.calcPalette(['#FFFF6D', '#1EA593'], 6);
      const expectedPalette = ['#FFFF6D', '#D2ED75', '#A5DB7C', '#78C984', '#4BB78B', '#1EA593'];
      expect(calculatedPalette).toEqual(expectedPalette);
    });

    test('throws error on invalid parameters', () => {
      expect(() => {
        SequentialPalette.calcPalette(['#FFFF6D', '#1EA593', '#BBBBAD'], 6);
      }).toThrow();
      expect(() => {
        SequentialPalette.calcPalette(['#FFFF6D', '#1EA593'], 1);
      }).toThrow();
    });
  });
});
