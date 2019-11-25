import { RectAnnotationSpec, DEFAULT_GLOBAL_ID } from '../utils/specs';
import { specComponentFactory, getConnect } from '../../../state/spec_factory';
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

type SpecRequiredProps = Pick<RectAnnotationSpec, 'id' | 'dataValues'>;
type SpecOptionalProps = Partial<
  Omit<
    RectAnnotationSpec,
    'chartType' | 'specType' | 'seriesType' | 'id' | 'dataValues' | 'domainType' | 'annotationType'
  >
>;
export const RectAnnotation: React.FunctionComponent<SpecRequiredProps & SpecOptionalProps> = getConnect()(
  specComponentFactory<RectAnnotationSpec, 'groupId' | 'annotationType' | 'zIndex' | 'style'>(defaultProps),
);
