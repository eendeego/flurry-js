/* flurry */

// @flow

import type {ColorModesType} from './color-modes';
import type {FlurryInfo, GlobalInfo} from './types';
import {randFlt} from './random';

import {initSmoke} from './smoke';
import {initSpark, updateSpark} from './spark';
import {initStar} from './star';
import {MAX_SPARKS, NUMSMOKEPARTICLES} from './constants';

export function deleteFlurryInfo(flurry: FlurryInfo): void {
  // flurry.s = null;
  // flurry.star = null;
  // for (let i = 0; i < flurry.spark.length; i++) {
  //   flurry.spark[i] = null;
  // }
  // flurry.spark = null;
  /* free(flurry); */
}

export function newFlurryInfo(
  global: GlobalInfo,
  streams: number,
  colour: ColorModesType,
  thickness: number,
  speed: number,
  bf: number,
): FlurryInfo {
  const flurryRandomSeed = randFlt(0.0, 300.0);
  const fOldTime = 0;
  const dframe = 0;
  const fTime = global.timeInSecondsSinceStart + flurryRandomSeed;

  const smoke = initSmoke(global.gl);
  for (let i = 0; i < NUMSMOKEPARTICLES / 4; i++) {
    for (let k = 0; k < 4; k++) {
      smoke.p[i].dead[k] = 1;
    }
  }

  const flurry = {
    next: null,
    currentColorMode: colour,
    s: smoke,
    star: initStar(speed),
    //   star->rotSpeed:speed,
    spark: Array.from({length: MAX_SPARKS}, (_, i) => {
      const spark = initSpark();
      spark.mystery =
        (1800 * (i + 1)) / 13; /* 100 * (i + 1) / (flurry->numStreams + 1); */
      return spark;
    }),
    streamExpansion: thickness,
    numStreams: streams,
    flurryRandomSeed,
    fTime,
    fOldTime: 0,
    fDeltaTime: fTime - fOldTime,
    briteFactor: bf,
    drag: 0,
    dframe,
  };

  flurry.spark.forEach((spark) => updateSpark(global, flurry, spark));

  return flurry;
}
