export type FlurryRenderingContext = {|
  gl: WebGLRenderingContext,
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
  const gl = canvas.getContext('webgl');
  // const gl = null;

  initExtension(gl, 'OES_element_index_uint');
  initExtension(gl, 'OES_texture_float');

  return {
    width: canvas.width,
    height: canvas.height,
    gl,
  };
}
