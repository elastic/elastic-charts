/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import Heading from '@theme/Heading';
import clsx from 'clsx';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  // Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Wide Range of Chart Types',
    description: (
      <>
        Support for XY charts (line, area, bar, bubble), partition charts (pie, donut, sunburst, treemap),
        heatmaps, goal charts, wordclouds, flame charts, and more.
      </>
    ),
  },
  {
    title: 'Performance Optimized',
    description: (
      <>
        Canvas rendering engine optimized for large datasets. Handle thousands of data points with smooth
        interactions and responsive updates.
      </>
    ),
  },
  {
    title: 'Highly Customizable',
    description: (
      <>
        Extensive theming system with granular control over every visual aspect. TypeScript-first with
        comprehensive type definitions and IntelliSense support.
      </>
    ),
  },
  {
    title: 'Interactive & Responsive',
    description: (
      <>
        Rich interactions including tooltips, brushing, clicking, hovering, and zooming. Automatic resizing
        and adaptive layouts for different screen sizes.
      </>
    ),
  },
  {
    title: 'Production Ready',
    description: (
      <>
        Battle-tested in Elastic&apos;s products with extensive test coverage. Semantic versioning and
        clear upgrade paths for stable production use.
      </>
    ),
  },
  {
    title: 'Open Source',
    description: (
      <>
        Apache 2.0 licensed with an active community. Contributions welcome! Check out the{' '}
        <a href="/docs/contributing">contributing guide</a> to get started.
      </>
    ),
  },
];

function Feature({ title, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')} style={{ marginBottom: '2rem' }}>
      {/* <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div> */}
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
