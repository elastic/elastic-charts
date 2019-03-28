import React from 'react';
import { Group, Line } from 'react-konva';
import { Dimensions } from '../../lib/utils/dimensions';
import { AnnotationLineProps } from '../../state/annotation_utils';

interface AnnotationProps {
  chartDimensions: Dimensions;
  debug: boolean;
  lines: AnnotationLineProps[];
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  render() {
    return this.renderAnnotation();
  }
  private renderAnnotationLine = (lineConfig: AnnotationLineProps, i: number) => {
    const { position } = lineConfig;

    const lineProps = {
      points: position,
      stroke: '#000',
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
