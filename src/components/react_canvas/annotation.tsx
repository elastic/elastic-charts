import React from 'react';
import { Group, Line } from 'react-konva';
import { Dimensions } from '../../lib/utils/dimensions';
import { AnnotationLinePosition } from '../../state/annotation_utils';

interface AnnotationProps {
  chartDimensions: Dimensions;
  debug: boolean;
  linePositions: any[];
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  render() {
    return this.renderAnnotation();
  }
  private renderAnnotationLine = (linePosition: AnnotationLinePosition, i: number) => {
    const lineProps = {
      points: linePosition,
      stroke: '#000',
      strokeWidth: 3,
    };

    return <Line key={`tick-${i}`} {...lineProps} />;
  }

  private renderAnnotation = () => {
    const { chartDimensions, linePositions } = this.props;

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        <Group key="grid-lines">{linePositions.map(this.renderAnnotationLine)}</Group>
      </Group>
    );
  }
}
