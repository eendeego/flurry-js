/* flurry */

// @flow

import type {GlobalInfo} from './types';
import type {PresetsType} from './presets';

import {NUMSMOKEPARTICLES} from './constants';
import {flurriesFromPreset} from './presets';
import {makeTexture} from './texture';
import {bootstrapWebGL, configureWebGL} from '../webgl/global';
import {initSeraphimBuffers} from '../webgl/seraphim-buffers';
import {initShaders} from '../webgl/seraphim-shaders';

export function boostrapGlobal(
  canvas: HTMLCanvasElement,
  preset: PresetsType,
): GlobalInfo {
  const gl = bootstrapWebGL(canvas);

  configureWebGL(gl);

  const seraphimProgramInfo = initShaders(gl);
  const seraphimBuffers = initSeraphimBuffers(gl, NUMSMOKEPARTICLES);

  // // Saving for future reference, not needed now
  // if (drawSparks) {
  //   // initSparkBuffers(global);
  // }

  return {
    gl,
    width: gl.canvas.clientWidth,
    height: gl.canvas.clientHeight,

    startTime: Date.now() * 0.001,
    timeInSecondsSinceStart: -1,
    frameCounter: 0,
    oldFrameTime: -1,

    flurries: flurriesFromPreset(preset, 0),
    seraphimProgramInfo,
    seraphimBuffers,
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
