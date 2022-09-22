import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { LineAnnotationSpec } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<LineAnnotationSpec<any>, "chartType" | "specType", "style" | "zIndex" | "groupId" | "hideLines" | "hideLinesTooltips" | "annotationType" | "hideTooltips", "offset" | "fallbackPlacements" | "placement" | "boundary" | "boundaryPadding" | "marker" | "customTooltip" | "markerBody" | "markerDimensions" | "markerPosition" | "customTooltipDetails" | "animations", "id" | "domainType" | "dataValues">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const LineAnnotation: <D = any>(props: SFProps<LineAnnotationSpec<D>, "chartType" | "specType", "style" | "zIndex" | "groupId" | "hideLines" | "hideLinesTooltips" | "annotationType" | "hideTooltips", "offset" | "fallbackPlacements" | "placement" | "boundary" | "boundaryPadding" | "marker" | "customTooltip" | "markerBody" | "markerDimensions" | "markerPosition" | "customTooltipDetails" | "animations", "id" | "domainType" | "dataValues">) => null;
/** @public */
export declare type LineAnnotationProps = ComponentProps<typeof LineAnnotation>;
export {};
//# sourceMappingURL=line_annotation.d.ts.map