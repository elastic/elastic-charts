/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

interface Row {
  state: string;
  profit: number;
  product: string;
}

export const data: Row[] = [
  { state: 'Florida', product: 'Powder', profit: 10000 },
  { state: 'Florida', product: 'Mascara', profit: 9000 },
  { state: 'Florida', product: 'Lip gloss', profit: 17000 },
  { state: 'Florida', product: 'Foundation', profit: 6000 },
  { state: 'Florida', product: 'Eyeliner', profit: 7000 },
  { state: 'Florida', product: 'Eyeshadow', profit: 1000 },
  { state: 'Florida', product: 'Lipstick', profit: 4000 },
  { state: 'Florida', product: 'Rouge', profit: 6000 },
  { state: 'Florida', product: 'Concealer', profit: 8000 },
  { state: 'Florida', product: 'Nail polish', profit: 8000 },
  { state: 'Texas', product: 'Powder', profit: 9000 },
  { state: 'Texas', product: 'Mascara', profit: 7000 },
  { state: 'Texas', product: 'Lip gloss', profit: 8000 },
  { state: 'Texas', product: 'Foundation', profit: 6000 },
  { state: 'Texas', product: 'Eyeliner', profit: 10000 },
  { state: 'Texas', product: 'Eyeshadow', profit: 9000 },
  { state: 'Texas', product: 'Lipstick', profit: 5000 },
  { state: 'Texas', product: 'Rouge', profit: -4000 },
  { state: 'Texas', product: 'Concealer', profit: -3000 },
  { state: 'Texas', product: 'Nail polish', profit: -2000 },
  { state: 'Nevada', product: 'Powder', profit: -5000 },
  { state: 'Nevada', product: 'Mascara', profit: -4000 },
  { state: 'Nevada', product: 'Lip gloss', profit: 2000 },
  { state: 'Nevada', product: 'Foundation', profit: -2000 },
  { state: 'Nevada', product: 'Eyeliner', profit: 1000 },
  { state: 'Nevada', product: 'Eyeshadow', profit: -2000 },
  { state: 'Nevada', product: 'Lipstick', profit: 1000 },
  { state: 'Nevada', product: 'Rouge', profit: -1000 },
  { state: 'Nevada', product: 'Concealer', profit: -1000 },
  { state: 'Nevada', product: 'Nail polish', profit: -1000 },
  { state: 'Arizona', product: 'Powder', profit: 20000 },
  { state: 'Arizona', product: 'Mascara', profit: 21000 },
  { state: 'Arizona', product: 'Lip gloss', profit: -1000 },
  { state: 'Arizona', product: 'Foundation', profit: 8000 },
  { state: 'Arizona', product: 'Eyeliner', profit: -2000 },
  { state: 'Arizona', product: 'Eyeshadow', profit: -1000 },
  { state: 'Arizona', product: 'Lipstick', profit: -4000 },
  { state: 'Arizona', product: 'Rouge', profit: 2000 },
  { state: 'Arizona', product: 'Concealer', profit: -1000 },
  { state: 'Arizona', product: 'Nail polish', profit: -1000 },
];
