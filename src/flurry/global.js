/* flurry */

// @flow

import type {GlobalInfo} from './types';

import OptimizationModes from './optimization-modes';

export function createGlobal(gl: WebGLRenderingContext): GlobalInfo {
  return {
    gl,

    // Only one supported in JS
    optMode: OptimizationModes.OPT_MODE_SCALAR_BASE,

    sys_glWidth: gl.canvas.width,
    sys_glHeight: gl.canvas.height,

    startTime: -1,
    timeInSecondsSinceStart: -1,
    frameCounter: 0,
    oldFrameTime: -1,

    flurry: null,
    texid: -1, // GLuint
  };
}
