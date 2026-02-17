/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

/**
 * Data where each category has wildly different Y-axis ranges.
 * This demonstrates the value of per-panel Y-axis domains:
 * - Category A: 0-100
 * - Category B: 0-10,000
 * - Category C: 0-5
 *
 * Without independentYDomain, categories A and C appear flat.
 */
export const independentYDomainData = [
  { x: '2024-01', y: 10, category: 'A' },
  { x: '2024-02', y: 45, category: 'A' },
  { x: '2024-03', y: 80, category: 'A' },
  { x: '2024-04', y: 60, category: 'A' },
  { x: '2024-05', y: 95, category: 'A' },

  { x: '2024-01', y: 1200, category: 'B' },
  { x: '2024-02', y: 5500, category: 'B' },
  { x: '2024-03', y: 9800, category: 'B' },
  { x: '2024-04', y: 7300, category: 'B' },
  { x: '2024-05', y: 4100, category: 'B' },

  { x: '2024-01', y: 1.2, category: 'C' },
  { x: '2024-02', y: 3.8, category: 'C' },
  { x: '2024-03', y: 2.1, category: 'C' },
  { x: '2024-04', y: 4.5, category: 'C' },
  { x: '2024-05', y: 0.9, category: 'C' },
];
