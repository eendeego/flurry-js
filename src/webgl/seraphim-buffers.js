// @flow strict

// Based on https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

export function initSeraphimBuffers(
  gl: WebGLRenderingContext,
  numSmokeParticles: number,
) {
  // Vertices
  const seraphimVertices = new Float32Array((numSmokeParticles * 2 + 1) * 4);
  const seraphimVerticesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, seraphimVerticesBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, seraphimVertices, gl.STREAM_DRAW);

  // Colors
  const seraphimColors = new Float32Array((numSmokeParticles * 4 + 1) * 4);
  const seraphimColorsBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, seraphimColorsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, seraphimColors, gl.STREAM_DRAW);

  // Textures
  const seraphimTextures = new Float32Array(numSmokeParticles * 2 * 4 * 4);
  const seraphimTexturesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, seraphimTexturesBuffer);
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
  const seraphimIndicesBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, seraphimIndicesBuffer);
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
