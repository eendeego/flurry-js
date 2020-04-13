/*

Copyright (c) 2002, Calum Robinson
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of its contributors may be used
  to endorse or promote products derived from this software without specific
  prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/* flurry */

// @flow

import type {ColorModesType} from './color-modes';
import type {FlurryInfo, GlobalInfo} from './types';
import {randFlt} from './flurry-h';

import {timeInSecondsSinceStart} from './flurry-c';
import {initSmoke} from './smoke';
import {initSpark, updateSpark} from './spark';
import {initStar} from './star';
import {MAX_SPARKS, NUMSMOKEPARTICLES} from './flurry-h';

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
  const fTime = timeInSecondsSinceStart(global) + flurryRandomSeed;

  const smoke = initSmoke();
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
