/**
 * Copyright 2020 Luis Reis
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

// @flow strict

// Based on https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

export function initBuffer2(
  gl: WebGLRenderingContext,
  target: number, // GLEnum,
): WebGLBuffer {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  return buffer;
}

export function initBuffers(
  gl: WebGLRenderingContext,
  numSmokeParticles: number,
) {
  // Vertices
  const seraphimVertices = new Float32Array((numSmokeParticles * 2 + 1) * 4);
  const seraphimVerticesBuffer = initBuffer2(gl, gl.ARRAY_BUFFER);
  gl.bufferData(gl.ARRAY_BUFFER, seraphimVertices, gl.STREAM_DRAW);

  // Colors
  const seraphimColors = new Float32Array((numSmokeParticles * 4 + 1) * 4);
  const seraphimColorsBuffer = initBuffer2(gl, gl.ARRAY_BUFFER);
  gl.bufferData(gl.ARRAY_BUFFER, seraphimColors, gl.STREAM_DRAW);

  // Textures
  const seraphimTextures = new Float32Array(numSmokeParticles * 2 * 4 * 4);
  const seraphimTexturesBuffer = initBuffer2(gl, gl.ARRAY_BUFFER);
  gl.bufferData(gl.ARRAY_BUFFER, seraphimTextures, gl.STREAM_DRAW);

  // Indices
  const seraphimIndices = new Uint16Array(numSmokeParticles * 3 * 2);
  for (let i = 0, j = 0; i < numSmokeParticles; i++) {
    seraphimIndices[j++] = i * 4;
    seraphimIndices[j++] = i * 4 + 1;
    seraphimIndices[j++] = i * 4 + 2;

    seraphimIndices[j++] = i * 4;
    seraphimIndices[j++] = i * 4 + 2;
    seraphimIndices[j++] = i * 4 + 3;
  }
  const seraphimIndicesBuffer = initBuffer2(gl, gl.ELEMENT_ARRAY_BUFFER);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, seraphimIndices, gl.STATIC_DRAW);

  return {
    seraphimVertices,
    seraphimVerticesBuffer,
    seraphimColors,
    seraphimColorsBuffer,
    seraphimTextures,
    seraphimTexturesBuffer,
    seraphimIndices,
    seraphimIndicesBuffer,
  };
}
