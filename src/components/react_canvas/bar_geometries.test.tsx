import { buildBarProps } from './bar_geometries';

describe('[canvas] Bar Geometries', () => {
  test('can build bar props', () => {
    const props = buildBarProps({
      index: 1,
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 1,
      borderEnabled: true,
      geometryStyle: {
        opacity: 0.5,
      },
    });
    expect(props).toEqual({
      key: `bar-1`,
      x: 10,
      y: 20,
      width: 30,
      height: 40,
      fill: 'red',
      stroke: 'blue',
      strokeWidth: 1,
      strokeEnabled: true,
      strokeHitEnabled: false,
      perfectDrawEnabled: false,
      listening: false,
      opacity: 0.5,
    });
  });
});
