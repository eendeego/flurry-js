export type FlurryRenderingContext = {|
  gl: WebGLRenderingContext,
|};

export function newRenderingContext(
  canvas: HTMLCanvasElement,
): FlurryRenderingContext {
  const gl = canvas.getContext('webgl');
  // const gl = null;

  return {
    width: canvas.width,
    height: canvas.height,
    gl,
  };
}
