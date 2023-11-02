import { ComponentProps } from 'react';
import { SFProps } from '../../../state/spec_factory';
import { LineAnnotationSpec } from '../utils/specs';
declare const buildProps: import("../../../state/spec_factory").BuildProps<LineAnnotationSpec, "chartType" | "specType", "style" | "zIndex" | "groupId" | "hideLines" | "hideLinesTooltips" | "annotationType" | "hideTooltips", "marker" | "fallbackPlacements" | "placement" | "offset" | "boundary" | "boundaryPadding" | "markerBody" | "markerDimensions" | "markerPosition" | "customTooltip" | "customTooltipDetails" | "animations", "id" | "domainType" | "dataValues">;
/**
 * Adds bar series to chart specs
 * @public
 */
export declare const LineAnnotation: <D = any>(props: SFProps<LineAnnotationSpec<D>, "chartType" | "specType", "style" | "zIndex" | "groupId" | "hideLines" | "hideLinesTooltips" | "annotationType" | "hideTooltips", "marker" | "fallbackPlacements" | "placement" | "offset" | "boundary" | "boundaryPadding" | "markerBody" | "markerDimensions" | "markerPosition" | "customTooltip" | "customTooltipDetails" | "animations", "id" | "domainType" | "dataValues">) => null;
/** @public */
export type LineAnnotationProps = ComponentProps<typeof LineAnnotation>;
export {};
//# sourceMappingURL=line_annotation.d.ts.map