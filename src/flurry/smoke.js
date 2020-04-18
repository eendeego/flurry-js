/* Smoke.cpp: implementation of the Smoke class. */

// @flow

import type {ProgramInfo, FlurryInfo, GlobalInfo, SmokeV} from './types';

import {MAGIC, NUMSMOKEPARTICLES} from './constants';
import {randBell, randFlt} from './random';

import {mat4} from 'gl-matrix';
import {initSeraphimBuffers} from '../webgl/seraphim-buffers';
import {initShaders} from '../webgl/seraphim-shaders';
import nullthrows from 'nullthrows';
import Deadness from './deadness';

function fastDistance2D(x: number, y: number): number {
  /* this function computes the distance from 0,0 to x,y with ~3.5% error */
  /* first compute the absolute value of x,y */
  const xx = x < 0.0 ? -x : x;
  const yy = y < 0.0 ? -y : y;

  /* compute the minimum of x,y */
  const mn = xx < yy ? xx : yy;

  /* return the distance */
  return xx + yy - mn * 0.5 - mn * 0.25 + mn * 0.0625;
}

export function initSmoke(gl: WebGLRenderingContext): SmokeV {
  const programInfo = initShaders(gl);

  const {
    seraphimVertices,
    seraphimVerticesBuffer,
    seraphimColors,
    seraphimColorsBuffer,
    seraphimTextures,
    seraphimTexturesBuffer,
    seraphimIndices,
    seraphimIndicesBuffer,
  } = initSeraphimBuffers(gl, NUMSMOKEPARTICLES);

  return {
    p: Array.from({length: NUMSMOKEPARTICLES / 4}, (_, i) => ({
      color: new Float32Array(4 * 4),
      position: new Float32Array(3 * 4),
      oldposition: new Float32Array(3 * 4),
      delta: new Float32Array(3 * 4),
      dead: new Uint32Array(4).fill(Deadness.alive),
      time: new Float32Array(4),
      animFrame: new Uint32Array(4),
    })),
    nextParticle: 0,
    nextSubParticle: 0,
    lastParticleTime: 0.25,
    firstTime: 1,
    frame: 0,
    old: Array.from({length: 3}, (_, i) => randFlt(-100.0, 100.0)),
    seraphimVertices,
    seraphimColors,
    seraphimTextures,
    seraphimIndices,
    seraphimVerticesBuffer,
    seraphimColorsBuffer,
    seraphimTexturesBuffer,
    seraphimIndicesBuffer,
    programInfo,
  };
}

export function updateSmoke(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: SmokeV,
): void {
  const sx = flurry.star.position[0];
  const sy = flurry.star.position[1];
  const sz = flurry.star.position[2];

  s.frame++;

  if (!s.firstTime) {
    /* release 12 puffs every frame */
    if (flurry.fTime - s.lastParticleTime >= 1.0 / 121.0) {
      const dx = s.old[0] - sx;
      const dy = s.old[1] - sy;
      const dz = s.old[2] - sz;
      const mag = 5.0;
      const deltax = dx * mag;
      const deltay = dy * mag;
      const deltaz = dz * mag;
      for (let i = 0; i < flurry.numStreams; i++) {
        s.p[s.nextParticle].delta[0 * 4 + s.nextSubParticle] = deltax;
        s.p[s.nextParticle].delta[1 * 4 + s.nextSubParticle] = deltay;
        s.p[s.nextParticle].delta[2 * 4 + s.nextSubParticle] = deltaz;
        s.p[s.nextParticle].position[0 * 4 + s.nextSubParticle] = sx;
        s.p[s.nextParticle].position[1 * 4 + s.nextSubParticle] = sy;
        s.p[s.nextParticle].position[2 * 4 + s.nextSubParticle] = sz;
        s.p[s.nextParticle].oldposition[0 * 4 + s.nextSubParticle] = sx;
        s.p[s.nextParticle].oldposition[1 * 4 + s.nextSubParticle] = sy;
        s.p[s.nextParticle].oldposition[2 * 4 + s.nextSubParticle] = sz;
        const streamSpeedCoherenceFactor = Math.max(
          0.0,
          1.0 + randBell(0.25 * MAGIC.incohesion),
        );
        const dx =
          s.p[s.nextParticle].position[0 * 4 + s.nextSubParticle] -
          flurry.spark[i].position[0];
        const dy =
          s.p[s.nextParticle].position[1 * 4 + s.nextSubParticle] -
          flurry.spark[i].position[1];
        const dz =
          s.p[s.nextParticle].position[2 * 4 + s.nextSubParticle] -
          flurry.spark[i].position[2];
        const f = MAGIC.streamSpeed * streamSpeedCoherenceFactor;

        const mag = f / Math.hypot(dx, dy, dz);

        s.p[s.nextParticle].delta[0 * 4 + s.nextSubParticle] -= dx * mag;
        s.p[s.nextParticle].delta[1 * 4 + s.nextSubParticle] -= dy * mag;
        s.p[s.nextParticle].delta[2 * 4 + s.nextSubParticle] -= dz * mag;

        s.p[s.nextParticle].color[0 * 4 + s.nextSubParticle] =
          flurry.spark[i].color[0] * (1.0 + randBell(MAGIC.colorIncoherence));
        s.p[s.nextParticle].color[1 * 4 + s.nextSubParticle] =
          flurry.spark[i].color[1] * (1.0 + randBell(MAGIC.colorIncoherence));
        s.p[s.nextParticle].color[2 * 4 + s.nextSubParticle] =
          flurry.spark[i].color[2] * (1.0 + randBell(MAGIC.colorIncoherence));
        s.p[s.nextParticle].color[3 * 4 + s.nextSubParticle] =
          0.85 * (1.0 + randBell(0.5 * MAGIC.colorIncoherence));

        s.p[s.nextParticle].time[s.nextSubParticle] = flurry.fTime;
        s.p[s.nextParticle].dead[s.nextSubParticle] = Deadness.alive;
        s.p[s.nextParticle].animFrame[s.nextSubParticle] = Math.floor(
          Math.random() * 64,
        );
        s.nextSubParticle++;
        if (s.nextSubParticle === 4) {
          s.nextParticle++;
          s.nextSubParticle = 0;
        }
        if (s.nextParticle >= NUMSMOKEPARTICLES / 4) {
          s.nextParticle = 0;
          s.nextSubParticle = 0;
        }
      }
      s.lastParticleTime = flurry.fTime;
    }
  } else {
    s.lastParticleTime = flurry.fTime;
    s.firstTime = 0;
  }

  for (let i = 0; i < 3; i++) {
    s.old[i] = flurry.star.position[i];
  }

  const frameRate = flurry.dframe / flurry.fTime;
  const frameRateModifier = 42.5 / frameRate;

  for (let i = 0; i < NUMSMOKEPARTICLES / 4; i++) {
    for (let k = 0; k < 4; k++) {
      if (s.p[i].dead[k] !== Deadness.alive) {
        continue;
      }

      let deltax = s.p[i].delta[0 * 4 + k];
      let deltay = s.p[i].delta[1 * 4 + k];
      let deltaz = s.p[i].delta[2 * 4 + k];

      for (let j = 0; j < flurry.numStreams; j++) {
        const dx = s.p[i].position[0 * 4 + k] - flurry.spark[j].position[0];
        const dy = s.p[i].position[1 * 4 + k] - flurry.spark[j].position[1];
        const dz = s.p[i].position[2 * 4 + k] - flurry.spark[j].position[2];
        const rsquared = dx * dx + dy * dy + dz * dz;

        let f = (MAGIC.gravity / rsquared) * frameRateModifier;

        if ((i * 4 + k) % flurry.numStreams === j) {
          f *= 1.0 + MAGIC.streamBias;
        }
        const mag = f / Math.sqrt(rsquared);

        deltax -= dx * mag;
        deltay -= dy * mag;
        deltaz -= dz * mag;
      }

      /* slow this particle down by flurry.drag */
      deltax *= flurry.drag;
      deltay *= flurry.drag;
      deltaz *= flurry.drag;

      if (deltax * deltax + deltay * deltay + deltaz * deltaz >= 25000000.0) {
        s.p[i].dead[k] = Deadness.dead;
        continue;
      }

      /* update the position */
      s.p[i].delta[0 * 4 + k] = deltax;
      s.p[i].delta[1 * 4 + k] = deltay;
      s.p[i].delta[2 * 4 + k] = deltaz;
      for (let j = 0; j < 3; j++) {
        s.p[i].oldposition[j * 4 + k] = s.p[i].position[j * 4 + k];
        s.p[i].position[j * 4 + k] +=
          s.p[i].delta[j * 4 + k] * flurry.fDeltaTime;
      }
    }
  }
}

export function drawSmoke(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: SmokeV,
  brightness: number,
): void {
  let svi = 0;
  let sci = 0;
  let sti = 0;
  let quads = 0;
  const screenRatio = global.width / 1024.0;
  const hslash2 = global.height * 0.5;
  const wslash2 = global.width * 0.5;

  const width = (MAGIC.streamSize + 2.5 * flurry.streamExpansion) * screenRatio;

  for (let i = 0; i < NUMSMOKEPARTICLES / 4; i++) {
    for (let k = 0; k < 4; k++) {
      if (s.p[i].dead[k] !== Deadness.alive) {
        continue;
      }

      const thisWidth =
        (MAGIC.streamSize +
          (flurry.fTime - s.p[i].time[k]) * flurry.streamExpansion) *
        screenRatio;
      if (thisWidth >= width) {
        s.p[i].dead[k] = Deadness.dead;
        continue;
      }
      const z = s.p[i].position[2 * 3 + k];
      const sx = (s.p[i].position[0 * 3 + k] * global.width) / z + wslash2;
      const sy = (s.p[i].position[1 * 3 + k] * global.width) / z + hslash2;
      const oldz = s.p[i].oldposition[2 * 3 + k];
      if (
        sx > global.width + 50.0 ||
        sx < -50.0 ||
        sy > global.height + 50.0 ||
        sy < -50.0 ||
        z < 25.0 ||
        oldz < 25.0
      ) {
        continue;
      }

      // If we are here, we're adding a quad
      quads++;

      const w = Math.max(1.0, thisWidth / z);
      {
        const oldx = s.p[i].oldposition[0 * 3 + k];
        const oldy = s.p[i].oldposition[1 * 3 + k];
        const oldscreenx = (oldx * global.width) / oldz + wslash2;
        const oldscreeny = (oldy * global.width) / oldz + hslash2;
        const dx = sx - oldscreenx;
        const dy = sy - oldscreeny;

        const d = fastDistance2D(dx, dy);

        let sm, os, ow;
        if (d) {
          sm = w / d;
        } else {
          sm = 0.0;
        }
        ow = Math.max(1.0, thisWidth / oldz);
        if (d) {
          os = ow / d;
        } else {
          os = 0.0;
        }

        {
          const m = 1.0 + sm;

          const dxs = dx * sm;
          const dys = dy * sm;
          const dxos = dx * os;
          const dyos = dy * os;
          const dxm = dx * m;
          const dym = dy * m;

          s.p[i].animFrame[k]++;
          if (s.p[i].animFrame[k] >= 64) {
            s.p[i].animFrame[k] = 0;
          }

          const u0 = (s.p[i].animFrame[k] & 7) * 0.125;
          const v0 = (s.p[i].animFrame[k] >> 3) * 0.125;
          const u1 = u0 + 0.125;
          const v1 = v0 + 0.125;

          let cm = 1.375 - thisWidth / width;
          if (s.p[i].dead[k] === Deadness.undead) {
            cm *= 0.125;
            s.p[i].dead[k] = Deadness.dead;
          }

          cm *= brightness;
          const cmv0 = s.p[i].color[0 * 4 + k] * cm;
          const cmv1 = s.p[i].color[1 * 4 + k] * cm;
          const cmv2 = s.p[i].color[2 * 4 + k] * cm;
          const cmv3 = s.p[i].color[3 * 4 + k] * cm;

          // #if 0
          if (false) {
            // /* MDT we can't use vectors in the Scalar routine */
            // s.seraphimColors[sci++].v = cmv.v;
            // s.seraphimColors[sci++].v = cmv.v;
            // s.seraphimColors[sci++].v = cmv.v;
            // s.seraphimColors[sci++].v = cmv.v;
          } else {
            for (let jj = 0; jj < 4; jj++) {
              s.seraphimColors[sci++] = cmv0;
              s.seraphimColors[sci++] = cmv1;
              s.seraphimColors[sci++] = cmv2;
              s.seraphimColors[sci++] = cmv3;
            }
          }

          s.seraphimTextures[sti++] = u0;
          s.seraphimTextures[sti++] = v0;
          s.seraphimTextures[sti++] = u0;
          s.seraphimTextures[sti++] = v1;

          s.seraphimTextures[sti++] = u1;
          s.seraphimTextures[sti++] = v1;
          s.seraphimTextures[sti++] = u1;
          s.seraphimTextures[sti++] = v0;

          s.seraphimVertices[svi++] = sx + dxm - dys;
          s.seraphimVertices[svi++] = sy + dym + dxs;
          s.seraphimVertices[svi++] = sx + dxm + dys;
          s.seraphimVertices[svi++] = sy + dym - dxs;
          s.seraphimVertices[svi++] = oldscreenx - dxm + dyos;
          s.seraphimVertices[svi++] = oldscreeny - dym - dxos;
          s.seraphimVertices[svi++] = oldscreenx - dxm - dyos;
          s.seraphimVertices[svi++] = oldscreeny - dym + dxos;
        }
      }
    }
  }

  if (quads > 0) {
    drawSeraphim(global, flurry, quads);
  }
}

function matrixes(gl: WebGLRenderingContext): [mat4, mat4] {
  const left = 0;
  const right = gl.canvas.clientWidth;
  const bottom = 0;
  const top = gl.canvas.clientHeight;
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

function drawSeraphim(
  global: GlobalInfo,
  flurry: FlurryInfo,
  quads: number,
): void {
  const {gl, texid} = global;
  const {
    s: {
      seraphimVertices,
      seraphimVerticesBuffer,
      seraphimTextures,
      seraphimTexturesBuffer,
      seraphimColors,
      seraphimColorsBuffer,
      seraphimIndicesBuffer,
      programInfo,
    },
  } = nullthrows(flurry);

  /* glDisable(gl.BLEND); */
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  const [projectionMatrix, modelViewMatrix] = matrixes(gl);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute.
  applyVertices(gl, programInfo, seraphimVerticesBuffer, seraphimVertices);

  // Tell WebGL how to pull out the positions from the position
  // buffer into the vertexPosition attribute
  applyTextures(gl, programInfo, seraphimTexturesBuffer, seraphimTextures);

  // Tell WebGL how to pull out the colors from the color buffer
  // into the vertexColor attribute.
  applyColors(gl, programInfo, seraphimColorsBuffer, seraphimColors);

  // Tell WebGL which indices to use to index the vertices
  applyIndices(gl, seraphimIndicesBuffer);

  // Tell WebGL to use our program when drawing

  gl.useProgram(programInfo.program);

  // Set the shader uniforms

  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    projectionMatrix,
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix,
  );

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);

  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texid);

  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = 6 * quads;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }
}
