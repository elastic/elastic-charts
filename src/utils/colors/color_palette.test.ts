import { DivergingPalette, QualitativePalette, SequentialPalette, calcColorPalette } from './color_palette';
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
      expect(calculatedPalette).toEqual(new SequentialPalette(colorPalette.colors, colorPalette.steps).calcPalette());
    });
    test('diverging', () => {
      const colorPalette: ColorPalette = {
        colors: ['#FFFF6D', '#1EA593', '#9BD77E'],
        steps: 3,
        type: 'diverging',
      };
      const calculatedPalette = calcColorPalette(colorPalette);
      expect(calculatedPalette).toEqual(new DivergingPalette(colorPalette.colors, colorPalette.steps).calcPalette());
    });
    test('qualitative', () => {
      const colorPalette: ColorPalette = {
        colors: ['#FFFF6D', '#1EA593', '#9BD77E'],
        steps: 3,
        type: 'qualitative',
      };
      const calculatedPalette = calcColorPalette(colorPalette);
      expect(calculatedPalette).toEqual(new QualitativePalette(colorPalette.colors, colorPalette.steps).calcPalette());
    });
  });

  describe('sequential palette', () => {
    test('calculates hex palette with default step', () => {
      const sequentialPalette = new SequentialPalette(['#FFFF6D', '#1EA593']);
      const calculatedPalette = sequentialPalette.calcPalette();
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
      const sequentialPalette = new SequentialPalette(['#FFFF6D', '#1EA593'], 6);
      const calculatedPalette = sequentialPalette.calcPalette();
      const expectedPalette = ['#FFFF6D', '#D2ED75', '#A5DB7C', '#78C984', '#4BB78B', '#1EA593'];
      expect(calculatedPalette).toEqual(expectedPalette);
    });

    test('throws error on invalid parameters', () => {
      expect(() => {
        new SequentialPalette(['#FFFF6D', '#1EA593', '#BBBBAD'], 6);
      }).toThrow();
      expect(() => {
        new SequentialPalette(['#FFFF6D', '#1EA593'], 1);
      }).toThrow();
    });
  });

  describe('diverging palette', () => {
    test('calculates hex palette', () => {
      const divergingPalette = new DivergingPalette(['#FFFF6D', '#1EA593', '#1EA593']);
      expect(divergingPalette.calcPalette()).toEqual([]);
    });

    test('throws error on invalid parameters', () => {
      expect(() => {
        new DivergingPalette(['#FFFF6D', '#1EA593']);
      }).toThrow();
    });
  });

  describe('qualitative palette', () => {
    test('calculates hex palette', () => {
      const divergingPalette = new QualitativePalette(['#FFFF6D', '#1EA593', '#A5DB7C', '#1EA593']);
      expect(divergingPalette.calcPalette()).toEqual([]);
    });
  });
});
