/* flurry */

// @flow

import type {PresetsType} from './presets';
import type {FlurryInfo, GlobalInfo} from './types';

import {DRAW_SPARKS} from './constants';
import {flurriesFromPreset} from './presets';
import {drawSmoke, updateSmoke} from './smoke';
import {drawSpark, updateSpark} from './spark';
// import {drawSpark, updateSpark, initSparkBuffers} from "./spark";
import {updateStar} from './star';

export function currentTime(): number {
  return Date.now() * 0.001;
}

function drawFlurry(global: GlobalInfo, flurry: FlurryInfo, b: number): void {
  flurry.dframe++;

  flurry.fOldTime = flurry.fTime;
  flurry.fTime = global.timeInSecondsSinceStart + flurry.flurryRandomSeed;
  flurry.fDeltaTime = flurry.fTime - flurry.fOldTime;

  flurry.drag = Math.pow(0.9965, flurry.fDeltaTime * 85.0);

  updateStar(global, flurry, flurry.star);

  // #ifdef DRAW_SPARKS
  if (DRAW_SPARKS) {
    // TODO
    // gl.shadeModel(gl.SMOOTH);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  }

  for (let i = 0; i < flurry.numStreams; i++) {
    flurry.spark[i].color[0] = 1.0;
    flurry.spark[i].color[1] = 1.0;
    flurry.spark[i].color[2] = 1.0;
    updateSpark(flurry, flurry.spark[i]);

    // #ifdef DRAW_SPARKS
    if (DRAW_SPARKS) {
      drawSpark(global, flurry, flurry.spark[i]);
    }
  }
  updateSmoke(global, flurry, flurry.s);

  drawSmoke(global, flurry, flurry.s, b);
}

export function resetFlurries(
  global: GlobalInfo,
  preset: PresetsType,
): GlobalInfo {
  // For a later day
  // if (preset === Presets.RANDOM) {
  //   return ((Math.round(Math.random() * Presets.MAX): any): PresetsType);
  // }

  return {
    ...global,
    startTime: currentTime(),
    oldFrameTime: -1,
    flurries: flurriesFromPreset(preset, global.timeInSecondsSinceStart),
  };
}

export function renderScene(global: GlobalInfo): void {
  const gl = global.gl;

  let deltaFrameTime = 0;
  let alpha;

  const newFrameTime = currentTime();
  global.timeInSecondsSinceStart = newFrameTime - global.startTime;
  if (global.oldFrameTime === -1) {
    /* special case the first frame -- clear to black */
    alpha = 1.0;
  } else {
    /*
     * this clamps the speed at below 60fps and, here
     * at least, produces a reasonably accurate 50fps.
     * (probably part CPU speed and part scheduler).
     *
     * Flurry is designed to run at this speed; much higher
     * than that and the blending causes the display to
     * saturate, which looks really ugly.
     */
    deltaFrameTime = newFrameTime - global.oldFrameTime;
    // Typical values will be ~ 5/60 = 0.083
    alpha = Math.min(5.0 * deltaFrameTime, 0.2);
  }
  global.oldFrameTime = newFrameTime;

  gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(0.0, 0.0, 0.0, alpha);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // const brite = Math.pow(deltaFrameTime, 0.75) * 10;
  const brite = Math.pow(deltaFrameTime, 0.75) * 10 * 5; // <= lmreis this 5 is mine

  for (const flurry of global.flurries) {
    drawFlurry(global, flurry, brite * flurry.briteFactor);
  }

  global.frameCounter++;
}
