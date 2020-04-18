// enum defined in flurry.h

// @flow

const ColorModes = Object.freeze({
  redColorMode: 0,
  magentaColorMode: 1,
  blueColorMode: 2,
  cyanColorMode: 3,
  greenColorMode: 4,
  yellowColorMode: 5,
  slowCyclicColorMode: 6,
  cyclicColorMode: 7,
  tiedyeColorMode: 8,
  rainbowColorMode: 9,
  whiteColorMode: 10,
  multiColorMode: 11,
  darkColorMode: 12,
});

export type ColorModesType = $Values<typeof ColorModes>;

export default ColorModes;
