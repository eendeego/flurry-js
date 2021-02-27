/* flurry */

// @flow

import type {ColorModesType} from './color-modes';
import type {FlurryInfo} from './types';
import {randFlt} from './random';

import {createSmoke} from './smoke';
import {createSpark, updateSpark} from './spark';
import {createStar} from './star';
import {MAX_SPARKS} from './constants';

export function deleteFlurryInfo(flurry: FlurryInfo): void {
  // flurry.s = null;
  // flurry.star = null;
  // for (let i = 0; i < flurry.spark.length; i++) {
  //   flurry.spark[i] = null;
  // }
  // flurry.spark = null;
  /* free(flurry); */
}

export function createFlurry(
  seed: number,
  streams: number,
  colour: ColorModesType,
  thickness: number,
  speed: number,
  bf: number,
): FlurryInfo {
  const flurryRandomSeed = randFlt(0.0, 300.0);
  const fOldTime = 0;
  const dframe = 0;
  const fTime = seed + flurryRandomSeed;

  const smoke = createSmoke();

  const flurry = {
    currentColorMode: colour,
    s: smoke,
    star: createStar(speed),
    spark: Array.from({length: MAX_SPARKS}, (_, i) => ({
      ...createSpark(),
      mystery:
        (1800 * (i + 1)) / 13 /* 100 * (i + 1) / (flurry->numStreams + 1); */,
    })),
    streamExpansion: thickness,
    numStreams: streams,
    flurryRandomSeed,
    fTime,
    fOldTime,
    fDeltaTime: fTime - fOldTime,
    briteFactor: bf,
    drag: 0,
    dframe,
  };

  flurry.spark.forEach((spark) => updateSpark(flurry, spark));

  return flurry;
}
