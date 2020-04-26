/* flurry */

// @flow

import type {GlobalInfo} from './types';
import {bootstrapWebGL, configureWebGL} from '../webgl/global';
import {makeTexture} from './texture';

export function boostrapGlobal(canvas: HTMLCanvasElement): GlobalInfo {
  const gl = bootstrapWebGL(canvas);

  configureWebGL(gl);

  // // Saving for future reference, not needed now
  // if (drawSparks) {
  //   // initSparkBuffers(global);
  // }

  return {
    gl,
    width: gl.canvas.clientWidth,
    height: gl.canvas.clientHeight,

    startTime: -1,
    timeInSecondsSinceStart: -1,
    frameCounter: 0,
    oldFrameTime: -1,

    flurries: [],
    smokeTexture: makeTexture(gl),
  };
}

export function resizeGlobal(global: GlobalInfo): GlobalInfo {
  return {
    ...global,
    width: global.gl.canvas.clientWidth,
    height: global.gl.canvas.clientHeight,
  };
}
