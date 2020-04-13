/*

Copyright (c) 2002, Calum Robinson
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of its contributors may be used
  to endorse or promote products derived from this software without specific
  prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

/* Smoke.cpp: implementation of the Smoke class. */

// @flow

import type {FlurryInfo, GlobalInfo, SmokeV} from './types';

import {
  MAGIC,
  NUMSMOKEPARTICLES,
  fastDistance2D,
  randBell,
  randFlt,
} from './flurry-h';

// #define MAXANGLES 16384
// #define NOT_QUITE_DEAD 3

// #define intensity 75000.0f;

export function initSmoke(): SmokeV {
  return {
    p: [],
    nextParticle: 0,
    nextSubParticle: 0,
    lastParticleTime: 0.25,
    firstTime: 1,
    frame: 0,
    old: Array.from({length: 3}, (_, i) => randFlt(-100.0, 100.0)),
    seraphimVertices: [],
    seraphimColors: [],
    seraphimTextures: [],
  };
}

export function updateSmoke_ScalarBase(
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
        s.p[s.nextParticle].delta[0][s.nextSubParticle] = deltax;
        s.p[s.nextParticle].delta[1][s.nextSubParticle] = deltay;
        s.p[s.nextParticle].delta[2][s.nextSubParticle] = deltaz;
        s.p[s.nextParticle].position[0][s.nextSubParticle] = sx;
        s.p[s.nextParticle].position[1][s.nextSubParticle] = sy;
        s.p[s.nextParticle].position[2][s.nextSubParticle] = sz;
        s.p[s.nextParticle].oldposition[0][s.nextSubParticle] = sx;
        s.p[s.nextParticle].oldposition[1][s.nextSubParticle] = sy;
        s.p[s.nextParticle].oldposition[2][s.nextSubParticle] = sz;
        const streamSpeedCoherenceFactor = Math.max(
          0.0,
          1.0 + randBell(0.25 * MAGIC.incohesion),
        );
        const dx =
          s.p[s.nextParticle].position[0][s.nextSubParticle] -
          flurry.spark[i].position[0];
        const dy =
          s.p[s.nextParticle].position[1][s.nextSubParticle] -
          flurry.spark[i].position[1];
        const dz =
          s.p[s.nextParticle].position[2][s.nextSubParticle] -
          flurry.spark[i].position[2];
        const f = MAGIC.streamSpeed * streamSpeedCoherenceFactor;

        const mag = f / Math.hypot(dx, dy, dz);

        s.p[s.nextParticle].delta[0][s.nextSubParticle] -= dx * mag;
        s.p[s.nextParticle].delta[1][s.nextSubParticle] -= dy * mag;
        s.p[s.nextParticle].delta[2][s.nextSubParticle] -= dz * mag;
        s.p[s.nextParticle].color[0][s.nextSubParticle] =
          flurry.spark[i].color[0] * (1.0 + randBell(MAGIC.colorIncoherence));
        s.p[s.nextParticle].color[1][s.nextSubParticle] =
          flurry.spark[i].color[1] * (1.0 + randBell(MAGIC.colorIncoherence));
        s.p[s.nextParticle].color[2][s.nextSubParticle] =
          flurry.spark[i].color[2] * (1.0 + randBell(MAGIC.colorIncoherence));
        s.p[s.nextParticle].color[3][s.nextSubParticle] =
          0.85 * (1.0 + randBell(0.5 * MAGIC.colorIncoherence));
        s.p[s.nextParticle].time[s.nextSubParticle] = flurry.fTime;
        s.p[s.nextParticle].dead[s.nextSubParticle] = 0;
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
      if (s.p[i].dead[k]) {
        continue;
      }

      let deltax = s.p[i].delta[0][k];
      let deltay = s.p[i].delta[1][k];
      let deltaz = s.p[i].delta[2][k];

      for (let j = 0; j < flurry.numStreams; j++) {
        const dx = s.p[i].position[0][k] - flurry.spark[j].position[0];
        const dy = s.p[i].position[1][k] - flurry.spark[j].position[1];
        const dz = s.p[i].position[2][k] - flurry.spark[j].position[2];
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
        s.p[i].dead[k] = 1;
        continue;
      }

      /* update the position */
      s.p[i].delta[0][k] = deltax;
      s.p[i].delta[1][k] = deltay;
      s.p[i].delta[2][k] = deltaz;
      for (let j = 0; j < 3; j++) {
        s.p[i].oldposition[j][k] = s.p[i].position[j][k];
        s.p[i].position[j][k] += s.p[i].delta[j][k] * flurry.fDeltaTime;
      }
    }
  }
}

export function drawSmoke_Scalar(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: SmokeV,
  brightness: number,
): void {
  let svi = 0;
  let sci = 0;
  let sti = 0;
  let si = 0;
  let width;
  let sx, sy;
  let u0, v0, u1, v1;
  let w, z;
  let screenRatio = global.sys_glWidth / 1024.0;
  let hslash2 = global.sys_glHeight * 0.5;
  let wslash2 = global.sys_glWidth * 0.5;

  width = (MAGIC.streamSize + 2.5 * flurry.streamExpansion) * screenRatio;

  for (let i = 0; i < NUMSMOKEPARTICLES / 4; i++) {
    for (let k = 0; k < 4; k++) {
      let thisWidth;
      let oldz;

      if (s.p[i].dead[k]) {
        continue;
      }
      thisWidth =
        (MAGIC.streamSize +
          (flurry.fTime - s.p[i].time[k]) * flurry.streamExpansion) *
        screenRatio;
      if (thisWidth >= width) {
        s.p[i].dead[k] = 1;
        continue;
      }
      z = s.p[i].position[2][k];
      sx = (s.p[i].position[0][k] * global.sys_glWidth) / z + wslash2;
      sy = (s.p[i].position[1][k] * global.sys_glWidth) / z + hslash2;
      oldz = s.p[i].oldposition[2][k];
      if (
        sx > global.sys_glWidth + 50.0 ||
        sx < -50.0 ||
        sy > global.sys_glHeight + 50.0 ||
        sy < -50.0 ||
        z < 25.0 ||
        oldz < 25.0
      ) {
        continue;
      }

      w = Math.max(1.0, thisWidth / z);
      {
        const oldx = s.p[i].oldposition[0][k];
        const oldy = s.p[i].oldposition[1][k];
        const oldscreenx = (oldx * global.sys_glWidth) / oldz + wslash2;
        const oldscreeny = (oldy * global.sys_glWidth) / oldz + hslash2;
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

          u0 = (s.p[i].animFrame[k] & 7) * 0.125;
          v0 = (s.p[i].animFrame[k] >> 3) * 0.125;
          u1 = u0 + 0.125;
          v1 = v0 + 0.125;
          let cm = 1.375 - thisWidth / width;
          if (s.p[i].dead[k] === 3) {
            cm *= 0.125;
            s.p[i].dead[k] = 1;
          }
          si++;
          cm *= brightness;
          const cmv = [
            s.p[i].color[0][k] * cm,
            s.p[i].color[1][k] * cm,
            s.p[i].color[2][k] * cm,
            s.p[i].color[3][k] * cm,
          ];

          // #if 0
          if (false) {
            // /* MDT we can't use vectors in the Scalar routine */
            // s.seraphimColors[sci++].v = cmv.v;
            // s.seraphimColors[sci++].v = cmv.v;
            // s.seraphimColors[sci++].v = cmv.v;
            // s.seraphimColors[sci++].v = cmv.v;
          } else {
            for (let jj = 0; jj < 4; jj++) {
              for (let ii = 0; ii < 4; ii++) {
                s.seraphimColors[sci][ii] = cmv[ii];
              }
              sci += 1;
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

          s.seraphimVertices[svi][0] = sx + dxm - dys;
          s.seraphimVertices[svi][1] = sy + dym + dxs;
          s.seraphimVertices[svi][2] = sx + dxm + dys;
          s.seraphimVertices[svi][3] = sy + dym - dxs;
          svi++;

          s.seraphimVertices[svi][0] = oldscreenx - dxm + dyos;
          s.seraphimVertices[svi][1] = oldscreeny - dym - dxos;
          s.seraphimVertices[svi][2] = oldscreenx - dxm - dyos;
          s.seraphimVertices[svi][3] = oldscreeny - dym + dxos;
          svi++;
        }
      }
    }
  }
  // // TODO
  // glColorPointer(4, GL_FLOAT, 0, s.seraphimColors);
  // glVertexPointer(2, GL_FLOAT, 0, s.seraphimVertices);
  // glTexCoordPointer(2, GL_FLOAT, 0, s.seraphimTextures);
  // glDrawArrays(GL_QUADS, 0, si * 4);
}
