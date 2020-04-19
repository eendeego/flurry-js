// enum defined in flurry.c

// @flow

export const Presets = Object.freeze({
  INSANE: -1,
  WATER: 0,
  FIRE: 1,
  PSYCHEDELIC: 2,
  RGB: 3,
  BINARY: 4,
  CLASSIC: 5,
  MAX: 6,
});

export type PresetsType = $Values<typeof Presets>;
