/* flurry */

// @flow

import type {GlobalInfo} from './types';

export function createGlobal(gl: WebGLRenderingContext): GlobalInfo {
  return {
    gl,
    sys_glWidth: gl.canvas.width,
    sys_glHeight: gl.canvas.height,

    startTime: -1,
    timeInSecondsSinceStart: -1,
    frameCounter: 0,
    oldFrameTime: -1,

    flurries: [],
    texid: -1, // GLuint
  };
}
