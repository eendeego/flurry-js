/* flurry */

// @flow

import type {GlobalInfo} from './types';
import type {PresetsType} from './presets';

import {NUMSMOKEPARTICLES, DEFAULT_SMOKE_PARAMETERS} from './constants';
import {flurriesFromPreset} from './presets';
import {createTexture} from './texture';
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

    smokeParameters: {...DEFAULT_SMOKE_PARAMETERS},

    flurries: flurriesFromPreset(DEFAULT_SMOKE_PARAMETERS, preset, 0),
    seraphimProgramInfo,
    seraphimBuffers,
    smokeTexture: createTexture(gl),
  };
}

export function resizeGlobal(
  global: GlobalInfo,
  width: number,
  height: number,
): GlobalInfo {
  return {
    ...global,
    width,
    height,
  };
}
