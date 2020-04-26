// enum defined in flurry.c

// @flow

import type {FlurryInfo} from './types';

import ColorModes from './color-modes';
import {createFlurry} from './flurry-info';

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

export function flurriesFromPreset(
  preset: PresetsType,
  seed: number = 0,
): Array<FlurryInfo> {
  /**
   * createFlurry arguments:
   *   timeInSecondsSinceStart: number,
   *   streams: number,
   *   colour: ColorModesType,
   *   thickness: number,
   *   speed: number,
   *   bf: number,
   */
  switch (preset) {
    case Presets.WATER:
      return Array.from({length: 9}, () =>
        createFlurry(seed, 1, ColorModes.blue, 100.0, 2.0, 2.0),
      );
    case Presets.FIRE:
      return [createFlurry(seed, 12, ColorModes.slowCyclic, 10000.0, 0.2, 1.0)];
    case Presets.PSYCHEDELIC:
      return [createFlurry(seed, 10, ColorModes.rainbow, 200.0, 2.0, 1.0)];
    case Presets.RGB:
      return [
        createFlurry(seed, 3, ColorModes.blue, 100.0, 0.8, 1.0),
        createFlurry(seed, 3, ColorModes.green, 100.0, 0.8, 1.0),
        createFlurry(seed, 3, ColorModes.red, 100.0, 0.8, 1.0),
      ];
    case Presets.BINARY:
      return [
        createFlurry(seed, 16, ColorModes.tiedye, 1000.0, 1.5, 1.0),
        createFlurry(seed, 16, ColorModes.tiedye, 1000.0, 0.5, 1.0),
      ];
    case Presets.CLASSIC:
      return [createFlurry(seed, 5, ColorModes.tiedye, 10000.0, 1.0, 1.0)];
    case Presets.INSANE:
      return [createFlurry(seed, 64, ColorModes.tiedye, 1000.0, 0.5, 0.5)];

    default: {
      console.log(`unknown preset ${preset}`);
      throw new Error(`unknown preset ${preset}`);
    }
  }
}
