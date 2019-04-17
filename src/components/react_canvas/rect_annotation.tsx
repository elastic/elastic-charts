import React from 'react';
import { Group, Rect } from 'react-konva';
import { RectAnnotationStyle } from '../../lib/themes/theme';
import { Dimensions } from '../../lib/utils/dimensions';
import { AnnotationLineProps } from '../../state/annotation_utils';

interface RectAnnotationProps {
  chartDimensions: Dimensions;
  debug: boolean;
  rects: AnnotationLineProps[];
  rectStyle: RectAnnotationStyle;
}

export class RectAnnotation extends React.PureComponent<RectAnnotationProps> {
  render() {
    return this.renderAnnotation();
  }
  private renderAnnotationRect = (lineConfig: AnnotationLineProps, i: number) => {
    const rectProps = {
      ...this.props.rectStyle,
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      fill: '#ececec',
    };

    return <Rect key={`rect-${i}`} {...rectProps} />;
  }

  private renderAnnotation = () => {
    const { chartDimensions, rects } = this.props;

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        {rects.map(this.renderAnnotationRect)}
      </Group>
    );
  }
}
