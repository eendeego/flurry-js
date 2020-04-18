// @flow strict

import type {GlobalInfo} from '../flurry/types';

export function init(global: GlobalInfo, drawSparks: boolean): void {
  const gl = global.gl;

  /* setup the defaults for OpenGL */
  gl.disable(gl.DEPTH_TEST);

  // Apparently unneeded in webgl
  // gl.shadeModel(gl.FLAT);
  // gl.disable(gl.LIGHTING);

  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.viewport(0, 0, global.sys_glWidth, global.sys_glHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (drawSparks) {
    // initSparkBuffers(global);
  }
}
