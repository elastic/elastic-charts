import React from 'react';
import { Group, Rect } from 'react-konva';
import { RectAnnotationStyle } from '../../../../utils/themes/theme';
import { AnnotationRectProps } from '../../annotations/rect_annotation_tooltip';

interface Props {
  rects: AnnotationRectProps[];
  rectStyle: RectAnnotationStyle;
}

export class RectAnnotation extends React.PureComponent<Props> {
  render() {
    const { rects } = this.props;
    return <Group key={'rect_annotations'}>{rects.map(this.renderAnnotationRect)}</Group>;
  }
  private renderAnnotationRect = (props: AnnotationRectProps, i: number) => {
    const { x, y, width, height } = props.rect;

    const rectProps = {
      ...this.props.rectStyle,
      x,
      y,
      width,
      height,
    };

    return <Rect {...rectProps} key={`rect-annotation-${i}`} />;
  };
}
