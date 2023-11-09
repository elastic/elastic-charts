/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { getBulletSpec } from './get_bullet_spec';
import { getChartSize } from './get_chart_size';
import { BulletDatum, BulletGraphSubtype } from '../../../chart_types/bullet_graph/spec';
import { createCustomCachedSelector } from '../../../state/create_selector';
import { getSettingsSpecSelector } from '../../../state/selectors/get_settings_spec';
import { withTextMeasure } from '../../../utils/bbox/canvas_text_bbox_calculator';
import { Size } from '../../../utils/dimensions';
import { wrapText } from '../../../utils/text/wrap';
import {
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
export interface BulletHeaderLayout {
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

/** @internal */
export interface BulletLayoutAlignment {
  maxTitleRows: number;
  maxSubtitleRows: number;
  multiline: boolean;
  minHeight: number;
  minWidth: number;
}

/** @internal */
export interface BulletGraphLayout {
  /** Common panel size */
  panel: Size;
  headerLayout: (BulletHeaderLayout | null)[][];
  layoutAlignment: BulletLayoutAlignment[];
  shouldRenderMetric: boolean;
}

const minChartHeights: Record<BulletGraphSubtype, number> = {
  [BulletGraphSubtype.horizontal]: 50,
  [BulletGraphSubtype.vertical]: 100,
  [BulletGraphSubtype.circle]: 160,
  [BulletGraphSubtype.halfCircle]: 160,
  [BulletGraphSubtype.twoThirdsCircle]: 160,
};

const minChartWidths: Record<BulletGraphSubtype, number> = {
  [BulletGraphSubtype.horizontal]: 140,
  [BulletGraphSubtype.vertical]: 140,
  [BulletGraphSubtype.circle]: 160,
  [BulletGraphSubtype.halfCircle]: 160,
  [BulletGraphSubtype.twoThirdsCircle]: 160,
};

/** @internal */
export const getLayout = createCustomCachedSelector(
  [getBulletSpec, getChartSize, getSettingsSpecSelector],
  (spec, chartSize, { locale }): BulletGraphLayout => {
    const { data } = spec;
    const rows = data.length;
    const columns = data.reduce((acc, row) => {
      return Math.max(acc, row.length);
    }, 0);

    const panel: Size = { width: chartSize.width / columns, height: chartSize.height / rows };
    const headerSize: Size = {
      width: panel.width - HEADER_PADDING.left - HEADER_PADDING.right,
      height: panel.height - HEADER_PADDING.top - HEADER_PADDING.bottom,
    };

    return withTextMeasure((textMeasurer) => {
      // collect header elements title, subtitles and values
      const header = data.map((row) =>
        row.map((cell) => {
          if (!cell) return null;

          const content = {
            title: cell.title.trim(),
            subtitle: cell.subtitle?.trim(),
            value: `${cell.valueFormatter(cell.value)}${cell.target ? ' ' : ''}`,
            target: cell.target ? `/ ${(cell.targetFormatter ?? cell.valueFormatter)(cell.target)}` : '',
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

      const goesToMultiline = header.some((row) => {
        const valueAlignedWithSubtitle = row.some((cell) => cell?.content.subtitle);
        return row.some((cell) => {
          if (!cell) return false;
          const valuesWidth = cell.size.value + cell.size.target;
          return valueAlignedWithSubtitle
            ? cell.size.subtitle + valuesWidth > headerSize.width || cell.size.title > headerSize.width
            : cell.size.title + valuesWidth > headerSize.width;
        });
      });

      const headerLayout = header.map((row) => {
        return row.map((cell) => {
          if (!cell) return null;

          if (goesToMultiline) {
            return {
              panel,
              header: headerSize,
              // wrap only title if necessary
              title: wrapText(
                cell.content.title,
                TITLE_FONT,
                TITLE_FONT_SIZE,
                headerSize.width,
                2,
                textMeasurer,
                locale,
              ),
              subtitle: cell.content.subtitle
                ? wrapText(
                    cell.content.subtitle,
                    SUBTITLE_FONT,
                    SUBTITLE_FONT_SIZE,
                    headerSize.width,
                    1,
                    textMeasurer,
                    locale,
                  )[0]
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
                HEADER_PADDING.top +
                HEADER_PADDING.bottom +
                minChartHeights[spec.subtype],
              minWidth: minChartWidths[spec.subtype],
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
      const shouldRenderMetric = chartSize.height <= totalHeight || chartSize.width <= totalWidth * columns;

      return {
        panel,
        headerLayout,
        layoutAlignment,
        shouldRenderMetric,
      };
    });
  },
);
