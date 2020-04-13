export type FlurryRenderingContext = {|
  gl: WebGLRenderingContext,
|};

export function newRenderingContext(
  canvas: HTMLCanvasElement,
): FlurryRenderingContext {
  const gl = canvas.getContext('webgl');
  // const gl = null;

  const oesElementIndexUint = gl.getExtension('OES_element_index_uint');
  if (oesElementIndexUint == null) {
    console.log('OES_element_index_uint not available');
  }

  return {
    width: canvas.width,
    height: canvas.height,
    gl,
  };
}
