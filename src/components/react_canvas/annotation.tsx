import React from 'react';
import { Group, Line } from 'react-konva';
import { Dimensions } from '../../lib/utils/dimensions';
import { AnnotationLineProps } from '../../state/annotation_utils';

interface AnnotationProps {
  chartDimensions: Dimensions;
  debug: boolean;
  lines: AnnotationLineProps[];
  isDetailsVisible?: boolean;
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  render() {
    return this.renderAnnotation();
  }
  private renderAnnotationLine = (lineConfig: AnnotationLineProps, i: number) => {
    const { position, details } = lineConfig;
    const color = details.isVisible ? '#ff0' : '#000';
    const lineProps = {
      points: position,
      stroke: color,
      strokeWidth: 30,
    };

    return <Line key={`tick-${i}`} {...lineProps} />;
  }

  private renderAnnotation = () => {
    const { chartDimensions, lines } = this.props;

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        <Group key="grid-lines">{lines.map(this.renderAnnotationLine)}</Group>
      </Group>
    );
  }
}
