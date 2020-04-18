// @flow strict

const nullthrows = require('nullthrows');

function initExtension(gl: WebGLRenderingContext, extension: string): void {
  const oesElementIndexUint = gl.getExtension(extension);
  if (oesElementIndexUint == null) {
    console.log(extension + ' not available');
  }
}

export function initWebGL(canvas: HTMLCanvasElement): WebGLRenderingContext {
  const gl = nullthrows(canvas.getContext('webgl'));

  initExtension(gl, 'OES_element_index_uint');
  initExtension(gl, 'OES_texture_float');

  /* setup the defaults for OpenGL */
  gl.disable(gl.DEPTH_TEST);

  // Apparently unneeded in webgl
  // gl.shadeModel(gl.FLAT);
  // gl.disable(gl.LIGHTING);

  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // // Saving for future reference, not needed now
  // if (drawSparks) {
  //   // initSparkBuffers(global);
  // }

  return gl;
}
