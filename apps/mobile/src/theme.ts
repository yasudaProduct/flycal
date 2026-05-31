export const colors = {
  primary: '#000000',
  onPrimary: '#ffffff',
  ink: '#000000',
  canvas: '#ffffff',
  inverseCanvas: '#000000',
  inverseInk: '#ffffff',
  hairline: '#e6e6e6',
  hairlineSoft: '#f1f1f1',
  surfaceSoft: '#f7f7f5',
  blockLime: '#dceeb1',
  blockLilac: '#c5b0f4',
  blockCream: '#f4ecd6',
  blockPink: '#efd4d4',
  blockMint: '#c8e6cd',
  blockCoral: '#f3c9b6',
  blockNavy: '#1f1d3d',
  accentMagenta: '#ff3d8b',
  semanticSuccess: '#1ea64a',
  overlayScrim: 'rgba(0,0,0,0.6)',
} as const;

export const typography = {
  displayXl: {
    fontSize: 48,
    fontWeight: '300' as const,
    lineHeight: 48,
    letterSpacing: -1.2,
  },
  displayLg: {
    fontSize: 36,
    fontWeight: '300' as const,
    lineHeight: 40,
    letterSpacing: -0.7,
  },
  headline: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  subhead: {
    fontSize: 22,
    fontWeight: '300' as const,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 29,
    letterSpacing: 0,
  },
  bodyLg: {
    fontSize: 17,
    fontWeight: '300' as const,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 16,
    fontWeight: '300' as const,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: '300' as const,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  button: {
    fontSize: 17,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 17,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

export const rounded = {
  xs: 2,
  sm: 6,
  md: 8,
  lg: 24,
  xl: 32,
  pill: 50,
  full: 9999,
} as const;

export const spacing = {
  hair: 1,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  section: 96,
} as const;
