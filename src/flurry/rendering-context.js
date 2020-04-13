export type FlurryRenderingContext = {|
  gl: FlurryInfo,
|};

export function newRenderingContext(
  canvas: HTMLCanvasElement,
): FlurryRenderingContext {
  const gl = canvas.getContext('webgl');

  return {
    width: canvas.width,
    height: canvas.height,
    gl,
  };
}
