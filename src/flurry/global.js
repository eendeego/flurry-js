/* flurry */

// @flow

import type {GlobalInfo} from './types';

export function createGlobal(gl: WebGLRenderingContext): GlobalInfo {
  return {
    gl,
    width: gl.canvas.clientWidth,
    height: gl.canvas.clientHeight,

    startTime: -1,
    timeInSecondsSinceStart: -1,
    frameCounter: 0,
    oldFrameTime: -1,

    flurries: [],
    texid: -1, // GLuint
  };
}

export function resizeGlobal(global: GlobalInfo): GlobalInfo {
  return {
    ...global,
    width: global.gl.canvas.clientWidth,
    height: global.gl.canvas.clientHeight,
  };
}
