import {mat4} from 'gl-matrix';

function matrixes(width: number, height: number): [mat4, mat4] {
  const left = 0;
  const right = width;
  const bottom = 0;
  const top = height;
  const near = -1;
  const far = 1;
  const projectionMatrix = mat4.create();

  mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  // mat4.translate(
  //   modelViewMatrix, // destination matrix
  //   modelViewMatrix, // matrix to translate
  //   [-0.0, 0.0, -6.0],
  // ); // amount to translate
  mat4.identity(modelViewMatrix);

  return [projectionMatrix, modelViewMatrix];
}

function applyVertices(
  gl: WebGLRenderingContext,
  programInfo: ProgramInfo,
  buffer: WebGLBuffer,
  data: $ArrayBufferView,
): void {
  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

function applyTextures(
  gl: WebGLRenderingContext,
  programInfo: ProgramInfo,
  buffer: WebGLBuffer,
  data: $ArrayBufferView,
): void {
  const numComponents = 2;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

function applyColors(
  gl: WebGLRenderingContext,
  programInfo: ProgramInfo,
  buffer: WebGLBuffer,
  data: $ArrayBufferView,
): void {
  const numComponents = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    numComponents,
    type,
    normalize,
    stride,
    offset,
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

function applyIndices(gl: WebGLRenderingContext, buffer: WebGLBuffer): void {
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
}

export default function drawSeraphim(
  global: GlobalInfo,
  flurry: FlurryInfo,
  quads: number,
): void {
  const {
    gl,
    width,
    height,
    smokeTexture,
    seraphimBuffers: {
      seraphimVertices,
      seraphimVerticesBuffer,
      seraphimTextures,
      seraphimTexturesBuffer,
      seraphimColors,
      seraphimColorsBuffer,
      seraphimIndicesBuffer,
    },
    seraphimProgramInfo,
  } = global;

  /* glDisable(gl.BLEND); */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const [projectionMatrix, modelViewMatrix] = matrixes(width, height);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  applyVertices(
    gl,
    seraphimProgramInfo,
    seraphimVerticesBuffer,
    seraphimVertices,
  );

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  applyTextures(
    gl,
    seraphimProgramInfo,
    seraphimTexturesBuffer,
    seraphimTextures,
  );

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  applyColors(gl, seraphimProgramInfo, seraphimColorsBuffer, seraphimColors);

  // Tell WebGL which indices to use to index the vertices
  applyIndices(gl, seraphimIndicesBuffer);

  // Tell WebGL to use our program when drawing

  gl.useProgram(seraphimProgramInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    seraphimProgramInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    seraphimProgramInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, smokeTexture);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(seraphimProgramInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = 6 * quads;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}
