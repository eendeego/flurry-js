// enum defined in flurry.c

// @flow

export const PresetNum = Object.freeze({
  PRESET_INSANE: -1,
  PRESET_WATER: 0,
  PRESET_FIRE: 1,
  PRESET_PSYCHEDELIC: 2,
  PRESET_RGB: 3,
  PRESET_BINARY: 4,
  PRESET_CLASSIC: 5,
  PRESET_MAX: 6,
});

export type PresetNumType = $Values<typeof PresetNum>;
