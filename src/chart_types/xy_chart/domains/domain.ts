import { Domain } from '../../../utils/domain';
import { ScaleType } from '../../../scales';

export interface BaseDomain {
  scaleType: ScaleType;
  domain: Domain;
  /* if the scale needs to be a band scale: used when displaying bars */
  isBandScale: boolean;
}
