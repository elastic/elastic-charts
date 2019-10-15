import React from 'react';
import { Group, Line } from 'react-konva';
import { LineAnnotationStyle } from '../../../../utils/themes/theme';
import { AnnotationLineProps } from '../../annotations/line_annotation_tooltip';

interface LineAnnotationProps {
  lines: AnnotationLineProps[];
  lineStyle: LineAnnotationStyle;
}

export class LineAnnotation extends React.PureComponent<LineAnnotationProps> {
  render() {
    const { lines } = this.props;

    return <Group key={'line_annotations'}>{lines.map(this.renderAnnotationLine)}</Group>;
  }
  private renderAnnotationLine = (lineConfig: AnnotationLineProps, i: number) => {
    const { line } = this.props.lineStyle;
    const { position } = lineConfig;

    const lineProps = {
      points: position,
      ...line,
    };
    return <Line {...lineProps} key={`annotation-line-${i}`} />;
  };
}
