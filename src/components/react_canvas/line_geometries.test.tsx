import { buildLinePointProps, buildLineProps } from './line_geometries';

describe('[canvas] Line Geometries', () => {
  test('can build area point props', () => {
    const props = buildLinePointProps({
      lineIndex: 1,
      pointIndex: 2,
      x: 10,
      y: 20,
      radius: 30,
      strokeWidth: 2,
      color: 'red',
      opacity: 0.5,
    });
    expect(props).toEqual({
      key: 'line-point-1-2',
      x: 10,
      y: 20,
      radius: 30,
      strokeWidth: 2,
      strokeEnabled: true,
      stroke: 'red',
      fill: 'white',
      opacity: 0.5,
      strokeHitEnabled: false,
      perfectDrawEnabled: false,
      listening: false,
    });

    const propsNoStroke = buildLinePointProps({
      lineIndex: 1,
      pointIndex: 2,
      x: 10,
      y: 20,
      radius: 30,
      strokeWidth: 0,
      color: 'red',
      opacity: 0.5,
    });
    expect(propsNoStroke).toEqual({
      key: 'line-point-1-2',
      x: 10,
      y: 20,
      radius: 30,
      strokeWidth: 0,
      strokeEnabled: false,
      stroke: 'red',
      fill: 'white',
      opacity: 0.5,
      strokeHitEnabled: false,
      perfectDrawEnabled: false,
      listening: false,
    });
  });
  test('can build area line path props', () => {
    const props = buildLineProps({
      index: 1,
      linePath: 'M0,0L10,10Z',
      color: 'red',
      strokeWidth: 1,
      opacity: 0.3,
      geometryStyle: {
        opacity: 0.5,
      },
    });
    expect(props).toEqual({
      key: `line-1`,
      data: 'M0,0L10,10Z',
      stroke: 'red',
      strokeWidth: 1,
      lineCap: 'round',
      lineJoin: 'round',
      opacity: 0.5,
      strokeHitEnabled: false,
      perfectDrawEnabled: false,
      listening: false,
    });
    expect(props.fill).toBeFalsy();
  });
});
