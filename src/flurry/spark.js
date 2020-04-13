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

/* Spark.cpp: implementation of the Spark class. */

// @flow

import type {FlurryInfo, GlobalInfo, Spark} from './types';

import ColorModes from './color-modes';
import {MAGIC, randBell, randFlt} from './flurry-h';

export function initSpark(): Spark {
  return {
    position: Array.from({length: 4}, (_, i) => randFlt(-100.0, 100.0)),
    mystery: 0,
    delta: [0, 0, 0],
    color: [0, 0, 0, 0],
  };
}

export function drawSpark(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: Spark,
): void {
  const black = [0.0, 0.0, 0.0, 1.0];
  const c = 0.0625;
  const width = (60000.0 * global.sys_glWidth) / 1024.0;

  const z = s.position[2];
  const sx =
    (s.position[0] * global.sys_glWidth) / z + global.sys_glWidth * 0.5;
  const sy =
    (s.position[1] * global.sys_glWidth) / z + global.sys_glHeight * 0.5;
  const w = (width * 4.0) / z;

  const screenx = sx;
  const screeny = sy;

  // TODO
  //   glPushMatrix();
  //   glTranslatef(screenx, screeny, 0.0);
  //   scale = w / 50.0;
  //   glScalef(scale, scale, 0.0);
  //   for (k = 0; k < 12; k++) {
  //     const a = Math.floor(Math.random() * 3600) / 10.0;
  //     glRotatef(a, 0.0, 0.0, 1.0);
  //     glBegin(GL_QUAD_STRIP);
  //     glColor4fv(black);
  //     glVertex2f(-3.0, 0.0);
  //     a = 2.0 + Math.floor(Math.random() * 256) * c;
  //     glVertex2f(-3.0, a);
  //     glColor4fv(s.color);
  //     glVertex2f(0.0, 0.0);
  //     glColor4fv(black);
  //     glVertex2f(0.0, a);
  //     glVertex2f(3.0, 0.0);
  //     glVertex2f(3.0, a);
  //     glEnd();
  //   }
  //   glPopMatrix();
}

const BIGMYSTERY = 1800.0;
const MAXANGLES = 16384;

export function updateSparkColour(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: Spark,
): void {
  const rotationsPerSecond = (2.0 * Math.PI * MAGIC.fieldSpeed) / MAXANGLES;
  const thisAngle = flurry.fTime * rotationsPerSecond;
  let cycleTime = 20.0;
  let baseRed;
  let baseGreen;
  let baseBlue;

  if (flurry.currentColorMode === ColorModes.rainbowColorMode) {
    cycleTime = 1.5;
  } else if (flurry.currentColorMode === ColorModes.tiedyeColorMode) {
    cycleTime = 4.5;
  } else if (flurry.currentColorMode === ColorModes.cyclicColorMode) {
    cycleTime = 20.0;
  } else if (flurry.currentColorMode === ColorModes.slowCyclicColorMode) {
    cycleTime = 120.0;
  }
  const colorRot = (2.0 * Math.PI) / cycleTime;
  const redPhaseShift = 0.0; /* cycleTime * 0.0f / 3.0f */
  const greenPhaseShift = cycleTime / 3.0;
  const bluePhaseShift = (cycleTime * 2.0) / 3.0;
  let colorTime = flurry.fTime;
  if (flurry.currentColorMode === ColorModes.whiteColorMode) {
    baseRed = 0.1875;
    baseGreen = 0.1875;
    baseBlue = 0.1875;
  } else if (flurry.currentColorMode === ColorModes.multiColorMode) {
    baseRed = 0.0625;
    baseGreen = 0.0625;
    baseBlue = 0.0625;
  } else if (flurry.currentColorMode === ColorModes.darkColorMode) {
    baseRed = 0.0;
    baseGreen = 0.0;
    baseBlue = 0.0;
  } else {
    if (flurry.currentColorMode < ColorModes.slowCyclicColorMode) {
      colorTime = (flurry.currentColorMode / 6.0) * cycleTime;
    } else {
      colorTime = flurry.fTime + flurry.flurryRandomSeed;
    }
    baseRed =
      0.109375 * (Math.cos((colorTime + redPhaseShift) * colorRot) + 1.0);
    baseGreen =
      0.109375 * (Math.cos((colorTime + greenPhaseShift) * colorRot) + 1.0);
    baseBlue =
      0.109375 * (Math.cos((colorTime + bluePhaseShift) * colorRot) + 1.0);
  }

  // cf is unused in original source
  // const cf =
  //   Math.cos(7.0 * (flurry.fTime * rotationsPerSecond)) +
  //   Math.cos(3.0 * (flurry.fTime * rotationsPerSecond)) +
  //   Math.cos(13.0 * (flurry.fTime * rotationsPerSecond));
  // cf /= 6.0;
  // cf += 2.0;
  const thisPointInRadians = (2.0 * Math.PI * s.mystery) / BIGMYSTERY;

  s.color[0] =
    baseRed +
    0.0625 *
      (0.5 +
        Math.cos(15.0 * (thisPointInRadians + 3.0 * thisAngle)) +
        Math.sin(7.0 * (thisPointInRadians + thisAngle)));
  s.color[1] =
    baseGreen + 0.0625 * (0.5 + Math.sin(thisPointInRadians + thisAngle));
  s.color[2] =
    baseBlue +
    0.0625 * (0.5 + Math.cos(37.0 * (thisPointInRadians + thisAngle)));
}

export function updateSpark(global: GlobalInfo, flurry: FlurryInfo, s: Spark) {
  const rotationsPerSecond = (2.0 * Math.PI * MAGIC.fieldSpeed) / MAXANGLES;
  const thisAngle = flurry.fTime * rotationsPerSecond;
  let cycleTime = 20.0;
  let baseRed;
  let baseGreen;
  let baseBlue;

  let old = new Array(3);

  if (flurry.currentColorMode === ColorModes.rainbowColorMode) {
    cycleTime = 1.5;
  } else if (flurry.currentColorMode === ColorModes.tiedyeColorMode) {
    cycleTime = 4.5;
  } else if (flurry.currentColorMode === ColorModes.cyclicColorMode) {
    cycleTime = 20.0;
  } else if (flurry.currentColorMode === ColorModes.slowCyclicColorMode) {
    cycleTime = 120.0;
  }
  const colorRot = (2.0 * Math.PI) / cycleTime;
  const redPhaseShift = 0.0; /* cycleTime * 0.0f / 3.0f */
  const greenPhaseShift = cycleTime / 3.0;
  const bluePhaseShift = (cycleTime * 2.0) / 3.0;
  let colorTime = flurry.fTime;
  if (flurry.currentColorMode === ColorModes.whiteColorMode) {
    baseRed = 0.1875;
    baseGreen = 0.1875;
    baseBlue = 0.1875;
  } else if (flurry.currentColorMode === ColorModes.multiColorMode) {
    baseRed = 0.0625;
    baseGreen = 0.0625;
    baseBlue = 0.0625;
  } else if (flurry.currentColorMode === ColorModes.darkColorMode) {
    baseRed = 0.0;
    baseGreen = 0.0;
    baseBlue = 0.0;
  } else {
    if (flurry.currentColorMode < ColorModes.slowCyclicColorMode) {
      colorTime = (flurry.currentColorMode / 6.0) * cycleTime;
    } else {
      colorTime = flurry.fTime + flurry.flurryRandomSeed;
    }
    baseRed =
      0.109375 * (Math.cos((colorTime + redPhaseShift) * colorRot) + 1.0);
    baseGreen =
      0.109375 * (Math.cos((colorTime + greenPhaseShift) * colorRot) + 1.0);
    baseBlue =
      0.109375 * (Math.cos((colorTime + bluePhaseShift) * colorRot) + 1.0);
  }

  for (let i = 0; i < 3; i++) {
    old[i] = s.position[i];
  }

  let cf =
    Math.cos(7.0 * (flurry.fTime * rotationsPerSecond)) +
    Math.cos(3.0 * (flurry.fTime * rotationsPerSecond)) +
    Math.cos(13.0 * (flurry.fTime * rotationsPerSecond));
  cf /= 6.0;
  cf += 2.0;
  const thisPointInRadians = (2.0 * Math.PI * s.mystery) / BIGMYSTERY;

  s.color[0] =
    baseRed +
    0.0625 *
      (0.5 +
        Math.cos(15.0 * (thisPointInRadians + 3.0 * thisAngle)) +
        Math.sin(7.0 * (thisPointInRadians + thisAngle)));
  s.color[1] =
    baseGreen + 0.0625 * (0.5 + Math.sin(thisPointInRadians + thisAngle));
  s.color[2] =
    baseBlue +
    0.0625 * (0.5 + Math.cos(37.0 * (thisPointInRadians + thisAngle)));
  s.position[0] =
    MAGIC.fieldRange *
    cf *
    Math.cos(11.0 * (thisPointInRadians + 3.0 * thisAngle));
  s.position[1] =
    MAGIC.fieldRange *
    cf *
    Math.sin(12.0 * (thisPointInRadians + 4.0 * thisAngle));
  s.position[2] =
    MAGIC.fieldRange * Math.cos(23.0 * (thisPointInRadians + 12.0 * thisAngle));

  let rotation = thisAngle * 0.501 + (5.01 * s.mystery) / BIGMYSTERY;
  let cr = Math.cos(rotation);
  let sr = Math.sin(rotation);

  const tmpX1 = s.position[0] * cr - s.position[1] * sr;
  const tmpY1 = s.position[1] * cr + s.position[0] * sr;
  const tmpZ1 = s.position[2];

  const tmpX2 = tmpX1 * cr - tmpZ1 * sr;
  const tmpY2 = tmpY1;
  const tmpZ2 = tmpZ1 * cr + tmpX1 * sr;

  const tmpX3 = tmpX2;
  const tmpY3 = tmpY2 * cr - tmpZ2 * sr;
  const tmpZ3 = tmpZ2 * cr + tmpY2 * sr + MAGIC.seraphDistance;

  rotation = thisAngle * 2.501 + (85.01 * s.mystery) / BIGMYSTERY;
  cr = Math.cos(rotation);
  sr = Math.sin(rotation);
  let tmpX4 = tmpX3 * cr - tmpY3 * sr;
  const tmpY4 = tmpY3 * cr + tmpX3 * sr;
  const tmpZ4 = tmpZ3;

  s.position[0] = tmpX4 + randBell(5.0 * MAGIC.fieldCoherence);
  s.position[1] = tmpY4 + randBell(5.0 * MAGIC.fieldCoherence);
  s.position[2] = tmpZ4 + randBell(5.0 * MAGIC.fieldCoherence);

  for (let i = 0; i < 3; i++) {
    s.delta[i] = (s.position[i] - old[i]) / flurry.fDeltaTime;
  }
}
