// enum defined in flurry.h

// @flow

const ColorModes = Object.freeze({
  red: 0,
  magenta: 1,
  blue: 2,
  cyan: 3,
  green: 4,
  yellow: 5,
  slowCyclic: 6,
  cyclic: 7,
  tiedye: 8,
  rainbow: 9,
  white: 10,
  multi: 11,
  dark: 12,
});

export type ColorModesType = $Values<typeof ColorModes>;

export default ColorModes;
