// @flow strict

const nullthrows = require('nullthrows');

/**
 * Initialize WebGL extension
 */
function initExtension(gl: WebGLRenderingContext, extension: string): void {
  const oesElementIndexUint = gl.getExtension(extension);
  if (oesElementIndexUint == null) {
    console.log(extension + ' not available');
  }
}

/**
 * Bootstrap WebGL and extensions
 */
export function bootstrapWebGL(
  canvas: HTMLCanvasElement,
): WebGLRenderingContext {
  const gl = nullthrows(canvas.getContext('webgl'));

  initExtension(gl, 'OES_element_index_uint');
  initExtension(gl, 'OES_texture_float');

  return gl;
}

/**
 * Configure WebGL for the visualization
 */
export function configureWebGL(
  gl: WebGLRenderingContext,
): WebGLRenderingContext {
  // Apparently unneeded in webgl
  // gl.shadeModel(gl.FLAT);
  // gl.disable(gl.LIGHTING);

  gl.disable(gl.CULL_FACE);
  gl.enable(gl.BLEND);
  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return gl;
}

export function resizeViewport(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
): void {
  gl.viewport(0.0, 0.0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT);
}
