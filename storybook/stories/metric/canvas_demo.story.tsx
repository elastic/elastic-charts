/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useEffect, useRef, useState } from 'react';

import { Font, cssFontShorthand } from '@elastic/charts/src/common/text_utils';
import { withContext } from '@elastic/charts/src/renderers/canvas';
import { withTextMeasure } from '@elastic/charts/src/utils/bbox/canvas_text_bbox_calculator';
import { wrapTextV3 } from '@elastic/charts/src/utils/text/wrap';

const fontSize = 24;
const defaultText =
  'Bacon ipsum dolor amet frankfurter chicken cupim, tri-tip flank kielbasa jerky. Pork strip steak jowl chuck filet mignon, burgdoggen kevin tail.';
const font: Font = {
  fontStyle: 'normal',
  fontFamily: 'sans-serif',
  fontVariant: 'normal',
  fontWeight: 500,
  textColor: 'red',
};

export const Example = () => {
  // const text = textInput(
  //   'text',
  //   'Bacon ipsum dolor amet frankfurter chicken cupim, tri-tip flank kielbasa jerky. Pork strip steak jowl chuck filet mignon, burgdoggen kevin tail.',
  // );
  // const maxLineWidth = number('maxLineWidth', 150, { range: true, min: 0, max: 400 });
  // const maxLines = number('maxLines', 3, { range: true, min: 1, max: 20 });

  const [maxLineWidth, setMaxLineWidth] = useState(400);
  const [maxLines, setMaxLines] = useState(4);
  const [text, setText] = useState(defaultText);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fontStyle = cssFontShorthand(font, fontSize);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    withContext(ctx, () => {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.font = fontStyle;
      ctx.textBaseline = 'hanging';
      ctx.strokeStyle = 'black';

      withTextMeasure((measure) => {
        const lines = wrapTextV3(text, measure, fontSize, font, fontSize, maxLineWidth, maxLines);
        // const lines = breakLongWordIntoLines(text, measure, fontSize, font, fontSize, maxLineWidth, 2);
        ctx.strokeRect(0, 0, maxLineWidth, fontSize * maxLines);
        ctx.fillStyle = 'black';

        lines.forEach((line, i) => {
          ctx.fillText(line, 1, 2 + i * fontSize);
        });
      });
    });
  }, [text, maxLineWidth, maxLines]);
  const width = 500;
  const height = 500;
  return (
    <>
      <div>
        <label style={{ display: 'inline-block', width: 200 }}> Max Line Width [{maxLineWidth}px]</label>
        <input
          type="range"
          min={0}
          max={width}
          value={maxLineWidth}
          className="slider"
          id="maxLineWidth"
          onInput={(e) => setMaxLineWidth(Number(e.currentTarget.value))}
        />
        <br />
        <label style={{ display: 'inline-block', width: 200 }}> Max Lines [{maxLines}]</label>
        <input
          type="range"
          min="0"
          max="10"
          value={maxLines}
          className="slider"
          id="maxLines"
          onInput={(e) => setMaxLines(Number(e.currentTarget.value))}
        />
        <div
          style={{
            margin: '20px 0',
          }}
        >
          <p>HTML Text</p>

          <textarea
            style={{
              padding: 0,
              margin: 0,
              width: maxLineWidth,
              height: maxLines * fontSize,
              fontSize,
              overflow: 'hidden',
              fontFamily: font.fontFamily,
              // fontWeight: font.fontWeight,
              fontStyle: font.fontStyle,
              fontVariant: font.fontVariant,
              lineHeight: `${fontSize}px`,
              resize: 'none',
              textOverflow: 'ellipsis',
            }}
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
          />
        </div>
      </div>
      <p>Canvas Text</p>
      <canvas
        ref={canvasRef}
        width={width * window.devicePixelRatio}
        height={height * window.devicePixelRatio}
        style={{ width, height }}
      />
    </>
  );
};
