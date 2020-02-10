module.exports = {
  roots: ['<rootDir>'],
  preset: 'ts-jest',
  clearMocks: true,
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.jest.json',
    },
  },
};
