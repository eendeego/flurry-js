/* flurry */

// @flow

import type {GlobalInfo} from './types';
import type {FlurryRenderingContext} from './rendering-context';

import OptimizationModes from './optimization-modes';

export function newGlobal(
  renderingContext: FlurryRenderingContext,
): GlobalInfo {
  return {
    /* system values */
    // glx_context: GLXContext,
    // window: Window,
    gl: renderingContext.gl,
    // canvas: HTMLCanvasElement,

    // Only one supported in JS
    optMode: OptimizationModes.OPT_MODE_SCALAR_BASE,

    sys_glWidth: renderingContext.width,
    sys_glHeight: renderingContext.height,

    startTime: -1,
    timeInSecondsSinceStart: -1,
    frameCounter: 0,
    oldFrameTime: -1,

    flurry: null,
    texid: -1, // GLuint
  };
}
