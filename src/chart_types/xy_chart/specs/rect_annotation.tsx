import { RectAnnotationSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { specComponentFactory, getConnect } from '../../../store/spec_factory';
import { DEFAULT_ANNOTATION_RECT_STYLE } from '../../../utils/themes/theme';
import { ChartTypes } from '../../index';

const defaultProps = {
  chartType: ChartTypes.XYAxis,
  specType: 'annotation' as 'annotation',
  groupId: DEFAULT_GLOBAL_ID,
  annotationType: 'rectangle' as 'rectangle',
  zIndex: -1,
  style: DEFAULT_ANNOTATION_RECT_STYLE,
};

export const RectAnnotation = getConnect()(
  specComponentFactory<RectAnnotationSpec, 'groupId' | 'annotationType' | 'zIndex' | 'style'>(defaultProps),
);
