/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { clamp } from 'lodash';
import React, { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Color } from '../../../../common/colors';
import { Ratio } from '../../../../common/geometry';
import { Size } from '../../../../utils/dimensions';
import { BulletDatum } from '../../spec';

/** @internal */
export interface BulletProps {
  datum: BulletDatum;
  colorBands: Array<{ color: Color; height: number; y: number }>;

  value: Ratio;
  // base: Ratio;
  target: Ratio;

  ticks: Ratio[];
  labels: Array<{ text: string; position: Ratio }>;
  size: Size;
}

const ratioToPercent = (value: Ratio) => `${Number(clamp(value * 100, 0, 100).toFixed(3))}%`;

const TARGET_SIZE = 40;
const BULLET_SIZE = 32;
const BAR_SIZE = 12;

function VerticalBulletComp(props: BulletProps) {
  return (
    <div className="echBulletGraphSVG--container">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <g className="echBulletGraph" style={{ transform: 'translate3d(calc(50% - 16px), 0, 0)' }}>
          {props.colorBands.map((band, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <rect
              className="echBullet--scaleBand"
              key={index}
              x={0}
              y={ratioToPercent(1 - band.y - band.height)}
              height={ratioToPercent(band.height)}
              width={BULLET_SIZE}
              fill={band.color}
            />
          ))}

          {/* {Number.isFinite(props.base) && ( */}
          {/*   <g className="echBullet--base" transform="translate(0,-1)"> */}
          {/*     <rect x={0} y={ratioToPercent(props.base)} width={BULLET_SIZE} height={2} fill={props.style.base} /> */}
          {/*   </g> */}
          {/* )} */}

          {props.ticks
            .filter((tick) => tick > 0 && tick < 1)
            .map((tick) => (
              <line
                className="echBullet--tick"
                key={`${tick}`}
                x1={0}
                y1={ratioToPercent(1 - tick)}
                x2={BULLET_SIZE}
                y2={ratioToPercent(1 - tick)}
                strokeWidth={1}
              />
            ))}
          <rect
            className="echBullet--bar"
            x={BULLET_SIZE / 2 - BAR_SIZE / 2}
            y={ratioToPercent(1 - props.value)}
            width={12}
            height={ratioToPercent(props.value)}
          />

          {Number.isFinite(props.target) && (
            <rect
              className="echBullet--target"
              x={-(TARGET_SIZE - BULLET_SIZE) / 2}
              y={ratioToPercent(1 - props.target)}
              width={40}
              height={3}
            />
          )}

          {props.labels.map((label) => {
            return (
              <text
                className="echBullet--tickLabel"
                key={label.text}
                x={-8}
                y={ratioToPercent(1 - label.position)}
                textAnchor="end"
                alignmentBaseline={label.position === 1 ? 'hanging' : 'baseline'}
              >
                {label.text}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/** @internal */
export const VerticalBullet = memo(VerticalBulletComp);

/** @internal */
export function HorizontalBulletComp(props: BulletProps) {
  return (
    <div className="echBulletGraphSVG--container">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <g className="echBulletGraph" style={{ transform: 'translate3d(0, calc(0), 0)' }}>
          {props.colorBands.map((band, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <rect
              className="echBullet--scaleBand"
              key={index}
              y={0}
              x={ratioToPercent(band.y)}
              width={ratioToPercent(band.height)}
              height={BULLET_SIZE}
              fill={band.color}
            />
          ))}

          {/* {Number.isFinite(props.base) && ( */}
          {/*   <g className="echBullet--base" transform="translate(0,-1)"> */}
          {/*     <rect x={0} y={ratioToPercent(props.base)} width={BULLET_SIZE} height={2} fill={props.style.base} /> */}
          {/*   </g> */}
          {/* )} */}

          {props.ticks
            .filter((tick) => tick > 0 && tick < 1)
            .map((tick) => (
              <line
                className="echBullet--tick"
                key={`${tick}`}
                y1={0}
                x1={ratioToPercent(tick)}
                y2={BULLET_SIZE}
                x2={ratioToPercent(tick)}
                strokeWidth={1}
              />
            ))}

          <rect
            className="echBullet--bar"
            y={BULLET_SIZE / 2 - BAR_SIZE / 2}
            x={0}
            height={12}
            width={ratioToPercent(props.value)}
          />

          {Number.isFinite(props.target) && (
            <rect
              className="echBullet--target"
              y={-(TARGET_SIZE - BULLET_SIZE) / 2}
              x={ratioToPercent(props.target)}
              height={40}
              width={3}
            />
          )}

          {props.labels.map((label) => {
            return (
              <text
                className="echBullet--tickLabel"
                key={label.text}
                y={TARGET_SIZE + 8}
                x={ratioToPercent(label.position)}
                textAnchor={label.position === 1 ? 'end' : 'start'}
              >
                {label.text}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/** @internal */
export const HorizontalBullet = memo(HorizontalBulletComp);

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);

  const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

  return ['M', start.x, start.y, 'A', radius, radius, 0, arcSweep, 0, end.x, end.y].join(' ');
}

/** @internal */
export function AngularBulletComp(props: BulletProps) {
  // const ref = useRef<SVGSVGElement>(null);
  const [fontSize, setFontSize] = useState(10);

  const onResize = useCallback((target, entry) => {
    // Handle the resize event
    const minSize = Math.min(entry.contentRect.width, entry.contentRect.height);
    setFontSize(minSize / 100);
    console.log(minSize);
  }, []);

  const ref = useResizeObserver<SVGSVGElement>(onResize);

  return (
    <div className="echBulletGraphSVG--container">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ref={ref}>
        <g className="echBulletGraph" style={{ transform: 'translate3d(0, calc(50%), 0)' }}>
          {props.colorBands.map((band, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <path
              key={index}
              className="echBullet--scaleBand"
              d={describeArc(50, 10, 45, 240 * band.y - 120, 240 * (band.y + band.height) - 120)}
              fill="none"
              stroke={band.color}
              strokeWidth={BULLET_SIZE}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {props.ticks
            .filter((tick) => tick > 0 && tick < 1)
            .map((tick) => (
              <path
                key={tick}
                className="echBullet--tick"
                d={describeArc(50, 10, 45, 240 * tick - 120, 240 * tick - 120 + 1)}
                fill="none"
                strokeWidth={BULLET_SIZE}
                vectorEffect="non-scaling-stroke"
              />
            ))}

          <path
            className="echBullet--angularBar"
            d={describeArc(50, 10, 45, -120, clamp(240 * props.value - 120, 0, 120))}
            fill="none"
            strokeWidth={12}
            vectorEffect="non-scaling-stroke"
          />

          {Number.isFinite(props.target) && (
            <path
              className="echBullet--angularTick"
              d={describeArc(50, 10, 45, 240 * props.target - 120, 240 * props.target - 120 + 2)}
              fill="none"
              strokeWidth={TARGET_SIZE}
              vectorEffect="non-scaling-stroke"
            />
          )}
          {props.labels.map((label) => {
            const coord = polarToCartesian(50, 10, 35, 240 * label.position - 120);
            return (
              <text
                className="echBullet--angularTickLabel"
                key={label.text}
                y={coord.y * fontSize}
                x={coord.x * fontSize}
                fontSize={10}
                // textAnchor="center"
                alignmentBaseline="middle"
                transform={`scale(${1 / fontSize} ${1 / fontSize})`}
                textAnchor={label.position > 0.5 ? 'end' : 'start'}
              >
                {label.text}
              </text>
            );
          })}
        </g>
      </svg>
      {/* <svg */}
      {/*   width="100%" */}
      {/*   height="100%" */}
      {/*   xmlns="http://www.w3.org/2000/svg" */}
      {/*   viewBox="0 0 100 100" */}
      {/*   style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0 }} */}
      {/*   preserveAspectRatio="xMidYMid meet" */}
      {/* > */}
      {/*   <g className="echBulletGraph" style={{ transform: 'translate3d(0, calc(50%), 0)' }}> */}
      {/*     {props.labels.map((label) => { */}
      {/*       const coord = polarToCartesian(50, 10, 45, 240 * label.position - 120); */}
      {/*       return ( */}
      {/*         <text */}
      {/*           className="echBullet--angularTickLabel" */}
      {/*           key={label.text} */}
      {/*           y={coord.y} */}
      {/*           x={coord.x} */}
      {/*           fontSize={`${10}%`} */}
      {/*           // textAnchor="center" */}
      {/*           vectorEffect="" */}
      {/*           alignmentBaseline="middle" */}
      {/*           textAnchor={label.position > 0.5 ? 'end' : 'start'} */}
      {/*         > */}
      {/*           {label.text} */}
      {/*         </text> */}
      {/*       ); */}
      {/*     })} */}
      {/*   </g> */}
      {/* </svg> */}
    </div>
  );
}

/** @internal */
export const AngularBullet = memo(AngularBulletComp);

function useResizeObserver<T extends SVGSVGElement>(callback: (target: T, entry: ResizeObserverEntry) => void) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref?.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callback(element, entry);
      }
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [callback, ref]);

  return ref;
}
