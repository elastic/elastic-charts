/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { chartSize, getBulletGraphSpec } from './chart_size';
import { ChartType } from '../../../chart_types';
import { BulletDatum, BulletGraphSpec } from '../../../chart_types/bullet_graph/spec';
import { SpecType } from '../../../specs';
import { GlobalChartState } from '../../../state/chart_state';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getSpecsByType } from '../../../state/selectors/get_specs_by_type';
import { withTextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { Dimensions, Size } from '../../../utils/dimensions';
import { wrapText } from '../../../utils/text/wrap';
import {
  GRAPH_PADDING,
  HEADER_PADDING,
  SUBTITLE_FONT,
  SUBTITLE_FONT_SIZE,
  SUBTITLE_LINE_HEIGHT,
  TARGET_FONT,
  TARGET_FONT_SIZE,
  TITLE_FONT,
  TITLE_FONT_SIZE,
  TITLE_LINE_HEIGHT,
  VALUE_FONT,
  VALUE_FONT_SIZE,
  VALUE_LINE_HEIGHT,
} from '../theme';

/** @internal */
export interface BulletGraphLayout {
  headerLayout: Array<
    Array<
      | {
          panel: Size;
          header: Size;
          title: string[];
          subtitle: string | undefined;
          value: string;
          target: string;
          multiline: boolean;
          valueWidth: number;
          targetWidth: number;
          sizes: { title: number; subtitle: number; value: number; target: number };
          datum: BulletDatum;
        }
      | undefined
    >
  >;
  layoutAlignment: Array<{
    maxTitleRows: number;
    maxSubtitleRows: number;
    multiline: boolean;
    minHeight: number;
    minWidth: number;
  }>;
  shouldRenderMetric: boolean;
}

/** @internal */
export const layout = createCustomCachedSelector([getBulletGraphSpec, chartSize], (specs, size): BulletGraphLayout => {
  const spec = specs[0]!;

  const { data } = spec;

  const rows = data.length;
  const columns = data.reduce((acc, row) => {
    return Math.max(acc, row.length);
  }, 0);

  const panel: Size = { width: size.width / columns, height: size.height / rows };
  const headerSize: Size = {
    width: panel.width - HEADER_PADDING[1] - HEADER_PADDING[3],
    height: panel.height - HEADER_PADDING[0] - HEADER_PADDING[2],
  };

  return withTextMeasure((textMeasurer) => {
    // collect header elements title, subtitles and values
    const header = data.map((row) =>
      row.map((cell) => {
        if (!cell) {
          return undefined;
        }
        const content = {
          title: cell.title.trim(),
          subtitle: cell.subtitle?.trim(),
          value: cell.valueFormatter(cell.value),
          target: cell.target ? `/ ${cell.valueFormatter(cell.target)}` : '',
          datum: cell,
        };
        const size = {
          title: textMeasurer(content.title.trim(), TITLE_FONT, TITLE_FONT_SIZE).width,
          subtitle: content.subtitle ? textMeasurer(content.subtitle, TITLE_FONT, TITLE_FONT_SIZE).width : 0,
          value: textMeasurer(content.value, VALUE_FONT, VALUE_FONT_SIZE).width,
          target: textMeasurer(content.target, TARGET_FONT, TARGET_FONT_SIZE).width,
        };
        return { content, size };
      }),
    );

    const goesToMultiline = header.some((row) =>
      row.some((cell) => {
        if (!cell) return false;
        const valuesWidth = cell.size.value + cell.size.target;
        return cell.content.subtitle
          ? cell.size.subtitle + valuesWidth > headerSize.width || cell.size.title > headerSize.width
          : cell.size.title + valuesWidth > headerSize.width;
      }),
    );

    const headerLayout = header.map((row) => {
      return row.map((cell) => {
        if (!cell) return undefined;
        if (goesToMultiline) {
          // wrap only title if necessary
          return {
            panel,
            header: headerSize,
            title: wrapText(cell.content.title, TITLE_FONT, TITLE_FONT_SIZE, headerSize.width, 2, textMeasurer),
            subtitle: cell.content.subtitle
              ? wrapText(cell.content.subtitle, SUBTITLE_FONT, SUBTITLE_FONT_SIZE, headerSize.width, 1, textMeasurer)[0]
              : undefined,
            value: cell.content.value,
            target: cell.content.target,
            multiline: true,
            valueWidth: cell.size.value,
            targetWidth: cell.size.target,
            sizes: cell.size,
            datum: cell.content.datum,
          };
        }
        // wrap only title if necessary
        return {
          panel,
          header: headerSize,
          title: [cell.content.title],
          subtitle: cell.content.subtitle ? cell.content.subtitle : undefined,
          value: cell.content.value,
          target: cell.content.target,
          multiline: false,
          valueWidth: cell.size.value,
          targetWidth: cell.size.target,
          sizes: cell.size,
          datum: cell.content.datum,
        };
      });
    });
    const layoutAlignment = headerLayout.map((curr) => {
      return curr.reduce(
        (rowStats, cell) => {
          const maxTitleRows = Math.max(rowStats.maxTitleRows, cell?.title.length ?? 0);
          const maxSubtitleRows = Math.max(rowStats.maxSubtitleRows, cell?.subtitle ? 1 : 0);
          return {
            maxTitleRows,
            maxSubtitleRows,
            multiline: cell?.multiline ?? false,
            minHeight:
              maxTitleRows * TITLE_LINE_HEIGHT +
              maxSubtitleRows * SUBTITLE_LINE_HEIGHT +
              (cell?.multiline ? VALUE_LINE_HEIGHT : 0) +
              HEADER_PADDING[0] +
              HEADER_PADDING[2] +
              (spec.subtype === 'horizontal' ? 50 : 100), // chart height
            minWidth: spec.subtype === 'horizontal' ? 140 : 140,
          };
        },
        { maxTitleRows: 0, maxSubtitleRows: 0, multiline: false, minHeight: 0, minWidth: 0 },
      );
    });

    const totalHeight = layoutAlignment.reduce((acc, curr) => {
      return acc + curr.minHeight;
    }, 0);

    const totalWidth = layoutAlignment.reduce((acc, curr) => {
      return Math.max(acc, curr.minWidth);
    }, 0);
    const shouldRenderMetric = size.height <= totalHeight || size.width <= totalWidth * columns;

    return {
      headerLayout,
      layoutAlignment,
      shouldRenderMetric,
    };
  });
});
