/* flurry */

// @flow

const nullthrows = require('nullthrows');

export type FlurryRenderingContext = {|
  gl: WebGLRenderingContext,
  width: number,
  height: number,
|};

function initExtension(gl: WebGLRenderingContext, extension: string): void {
  const oesElementIndexUint = gl.getExtension(extension);
  if (oesElementIndexUint == null) {
    console.log(extension + ' not available');
  }
}

export function newRenderingContext(
  canvas: HTMLCanvasElement,
): FlurryRenderingContext {
  const gl = nullthrows(canvas.getContext('webgl'));

  initExtension(gl, 'OES_element_index_uint');
  initExtension(gl, 'OES_texture_float');

  return {
    gl,
    width: canvas.width,
    height: canvas.height,
  };
}
