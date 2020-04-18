// @flow strict

// Based on https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL

export function initTexture(
  gl: WebGLRenderingContext,
  data: $ArrayBufferView,
): WebGLTexture {
  const texture = gl.createTexture();
  const alignment = 1;
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, alignment);

  gl.bindTexture(gl.TEXTURE_2D, texture);

  /* Set the tiling mode (this is generally always GL_REPEAT). */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  /* Set the filtering. */
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const level = 0;
  const internalFormat = gl.LUMINANCE_ALPHA;
  const width = 256;
  const height = 256;
  const border = 0;
  const srcFormat = gl.LUMINANCE_ALPHA;
  const srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(
    gl.TEXTURE_2D,
    level,
    internalFormat,
    width,
    height,
    border,
    srcFormat,
    srcType,
    data,
  );
  gl.generateMipmap(gl.TEXTURE_2D);

  // Apparently unneeded in webgl / implemented in shader
  // gl.texEnvf(gl.TEXTURE_ENV, gl.TEXTURE_ENV_MODE, gl.MODULATE);

  return texture;
}
