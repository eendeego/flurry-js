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

/* flurry */

// @flow

import type {PresetNumType} from './preset-num';
import type {FlurryInfo, GlobalInfo} from './types';

import ColorModes from './color-modes';
import {timeInSecondsSinceStart} from './flurry-c';
import {DRAW_SPARKS} from './flurry-h';
import {newFlurryInfo} from './flurry-info';
import {PresetNum} from './preset-num';
import {drawSmoke_Scalar, updateSmoke_ScalarBase} from './smoke';
import {drawSpark, updateSpark, initSparkBuffers} from './spark';
import {updateStar} from './star';
import {makeTexture} from './texture';

export const DEF_PRESET = 'random';

export function GLSetupRC(global: GlobalInfo): void {
  const gl = global.gl;
  // TODO
  /* setup the defaults for OpenGL */
  gl.disable(gl.DEPTH_TEST); // webgl-safe
  // // gl.alphaFunc(gl.GREATER, 0.0);
  // // gl.enable(gl.ALPHA_TEST);
  // // gl.shadeModel(gl.FLAT);
  // // gl.disable(gl.LIGHTING);
  gl.disable(gl.CULL_FACE); // webgl-safe
  gl.enable(gl.BLEND); // webgl-safe
  gl.viewport(0, 0, global.sys_glWidth, global.sys_glHeight); // webgl-safe

  // // DONE - In drawSeraphim
  // gl.matrixMode(gl.PROJECTION);
  // gl.loadIdentity();
  // gl.ortho(0, global.sys_glWidth, 0, global.sys_glHeight, -1, 1);

  // // gl.matrixMode(gl.MODELVIEW);
  // // gl.loadIdentity();
  // gl.clear(gl.COLOR_BUFFER_BIT); // webgl-safe

  // // "DONE" - No longer exists
  // gl.enableClientState(gl.COLOR_ARRAY);
  // gl.enableClientState(gl.VERTEX_ARRAY);
  // gl.enableClientState(gl.TEXTURE_COORD_ARRAY);

  // Buffer initialization is performed in initSmoke (called from initFlurry)

  if (DRAW_SPARKS) {
    initSparkBuffers(global);
  }
}

// const updateSmoke = (function () {
//   switch (global.optMode) {
//     case OptimizationModes.OPT_MODE_SCALAR_BASE:
//       return updateSmoke_ScalarBase;
//     // case OptimizationModes.OPT_MODE_SCALAR_FRSQRTE:
//     //   UpdateSmoke_ScalarFrsqrte(global, flurry, flurry.s);
//     //   break;
//     // case OptimizationModes.OPT_MODE_VECTOR_SIMPLE:
//     //   UpdateSmoke_VectorBase(global, flurry, flurry.s);
//     //   break;
//     // case OptimizationModes.OPT_MODE_VECTOR_UNROLLED:
//     //   UpdateSmoke_VectorUnrolled(global, flurry, flurry.s);
//     //   break;
//     default:
//       throw new Error("Unsupported optMode: " + global.optMode);
//   }
// })();

// const drawSmoke = (function () {
//   switch (global.optMode) {
//     case OptimizationModes.OPT_MODE_SCALAR_BASE:
//       // case OptimizationModes.OPT_MODE_SCALAR_FRSQRTE:
//       return drawSmoke_Scalar;
//     // case OptimizationModes.OPT_MODE_VECTOR_SIMPLE:
//     // case OptimizationModes.OPT_MODE_VECTOR_UNROLLED:
//     //   DrawSmoke_Vector(global, flurry, flurry.s, b);
//     //   break;
//     default:
//       throw new Error("Unsupported optMode: " + global.optMode);
//   }
// })();

export function GLRenderScene(
  global: GlobalInfo,
  flurry: FlurryInfo,
  b: number,
): void {
  // const gl = global.gl;

  flurry.dframe++;
  flurry.fOldTime = flurry.fTime;
  flurry.fTime = timeInSecondsSinceStart(global) + flurry.flurryRandomSeed;
  flurry.fDeltaTime = flurry.fTime - flurry.fOldTime;
  flurry.drag = Math.pow(0.9965, flurry.fDeltaTime * 85.0);
  updateStar(global, flurry, flurry.star);
  // #ifdef DRAW_SPARKS
  if (DRAW_SPARKS) {
    // TODO
    // gl.shadeModel(gl.SMOOTH);
    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  }

  for (let i = 0; i < flurry.numStreams; i++) {
    flurry.spark[i].color[0] = 1.0;
    flurry.spark[i].color[1] = 1.0;
    flurry.spark[i].color[2] = 1.0;
    flurry.spark[i].color[2] = 1.0; // TODO Bug?
    updateSpark(global, flurry, flurry.spark[i]);

    // #ifdef DRAW_SPARKS
    if (DRAW_SPARKS) {
      drawSpark(global, flurry, flurry.spark[i]);
    }
  }
  updateSmoke_ScalarBase(global, flurry, flurry.s);

  /* glDisable(gl.BLEND); */
  // gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  // gl.enable(gl.TEXTURE_2D);
  drawSmoke_Scalar(global, flurry, flurry.s, b);
  // gl.disable(gl.TEXTURE_2D);
}

export function GLResize(global: GlobalInfo, w: number, h: number): void {
  global.sys_glWidth = w;
  global.sys_glHeight = h;
}

const presetStr2PresetNum = {
  water: PresetNum.PRESET_WATER,
  fire: PresetNum.PRESET_FIRE,
  psychedelic: PresetNum.PRESET_PSYCHEDELIC,
  rgb: PresetNum.PRESET_RGB,
  binary: PresetNum.PRESET_BINARY,
  classic: PresetNum.PRESET_CLASSIC,
  insane: PresetNum.PRESET_INSANE,
};
function presetStr2Num(presetStr: ?string): PresetNumType {
  if (presetStr == null || presetStr.length === 0) {
    return presetStr2Num(DEF_PRESET);
  }

  if (presetStr === 'random') {
    return ((Math.round(
      Math.random() * PresetNum.PRESET_MAX,
    ): any): PresetNumType);
  }

  if (presetStr2PresetNum[presetStr] != null) {
    return presetStr2PresetNum[presetStr];
  }

  throw new Error(`unknown preset ${presetStr}`);
}

/* new window size or exposure */
export function reshapeFlurry(global: GlobalInfo) {
  // const gl = global.gl;
  // // TODO
  // // gl.makeCurrent(MI_DISPLAY(mi), global.window, global.glx_context);
  // gl.viewport(0.0, 0.0, global.sys_glWidth, global.sys_glHeight);
  // // gl.matrixMode(gl.PROJECTION);
  // // gl.loadIdentity();
  // // gl.ortho(0, global.sys_glWidth, 0, global.sys_glHeight, -1, 1);
  // // gl.matrixMode(gl.MODELVIEW);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.flush();
  GLResize(global, global.sys_glWidth, global.sys_glHeight);
}

// TODO add physical config argument
export function initFlurry(global: GlobalInfo, presetStr: ?string) {
  global.gTimeCounter = Date.now();

  global.flurry = null;

  const presetNum = presetStr2Num(presetStr);

  switch (presetNum) {
    case PresetNum.PRESET_WATER: {
      for (let i = 0; i < 9; i++) {
        const flurry = newFlurryInfo(
          global,
          1,
          ColorModes.blueColorMode,
          100.0,
          2.0,
          2.0,
        );
        flurry.next = global.flurry;
        global.flurry = flurry;
      }
      break;
    }
    case PresetNum.PRESET_FIRE: {
      const flurry = newFlurryInfo(
        global,
        12,
        ColorModes.slowCyclicColorMode,
        10000.0,
        0.2,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      break;
    }
    case PresetNum.PRESET_PSYCHEDELIC: {
      const flurry = newFlurryInfo(
        global,
        10,
        ColorModes.rainbowColorMode,
        200.0,
        2.0,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      break;
    }
    case PresetNum.PRESET_RGB: {
      let flurry = newFlurryInfo(
        global,
        3,
        ColorModes.redColorMode,
        100.0,
        0.8,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      flurry = newFlurryInfo(
        global,
        3,
        ColorModes.greenColorMode,
        100.0,
        0.8,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      flurry = newFlurryInfo(
        global,
        3,
        ColorModes.blueColorMode,
        100.0,
        0.8,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      break;
    }
    case PresetNum.PRESET_BINARY: {
      let flurry = newFlurryInfo(
        global,
        16,
        ColorModes.tiedyeColorMode,
        1000.0,
        0.5,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      flurry = newFlurryInfo(
        global,
        16,
        ColorModes.tiedyeColorMode,
        1000.0,
        1.5,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      break;
    }
    case PresetNum.PRESET_CLASSIC: {
      const flurry = newFlurryInfo(
        global,
        5,
        ColorModes.tiedyeColorMode,
        10000.0,
        1.0,
        1.0,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      break;
    }
    case PresetNum.PRESET_INSANE: {
      const flurry = newFlurryInfo(
        global,
        64,
        ColorModes.tiedyeColorMode,
        1000.0,
        0.5,
        0.5,
      );
      flurry.next = global.flurry;
      global.flurry = flurry;
      break;
    }
    default: {
      console.log(`unknown preset ${presetStr ?? '<null>'} | ${presetNum}`);
    }
  }

  //   if (init_GL(mi)) {
  reshapeFlurry(global);
  GLSetupRC(global);
  //   } else {
  //     // // TODO
  //     // MI_CLEARWINDOW(mi);
  //   }
  global.oldFrameTime = -1;
}

export function drawFlurry(global: GlobalInfo): void {
  const gl = global.gl;

  if (global.flurry?.s?.programInfo == null) {
    debugger;
  }

  let deltaFrameTime = 0;
  let alpha;

  const newFrameTime = Date.now();
  if (global.oldFrameTime === -1) {
    /* special case the first frame -- clear to black */
    alpha = 1.0;
  } else {
    /*
     * this clamps the speed at below 60fps and, here
     * at least, produces a reasonably accurate 50fps.
     * (probably part CPU speed and part scheduler).
     *
     * Flurry is designed to run at this speed; much higher
     * than that and the blending causes the display to
     * saturate, which looks really ugly.
     */
    // TODO
    // if (newFrameTime - global.oldFrameTime < 1 / 60.0) {
    //   usleep(MAX_(1, int(20000 * (newFrameTime - global.oldFrameTime))));
    //   return;
    // }
    deltaFrameTime = newFrameTime - global.oldFrameTime;
    alpha = 5.0 * deltaFrameTime;
  }
  global.oldFrameTime = newFrameTime;

  if (alpha > 0.2) alpha = 0.2;

  // TODO
  //   if (!global.glx_context) return;

  if (global.frameCounter === 0) {
    global.texid = makeTexture(gl);
  }

  // TODO
  // gl.drawBuffer(gl.BACK);
  // gl.xMakeCurrent(display, window, *global.glx_context);

  // TODO (works in webgl!)
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // TODONE
  // gl.color4f(0.0, 0.0, 0.0, alpha);
  // gl.rectd(0, 0, global.sys_glWidth, global.sys_glHeight);
  gl.clearColor(0.0, 0.0, 0.0, alpha);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const brite = Math.pow(deltaFrameTime, 0.75) * 10;
  for (let flurry = global.flurry; flurry; flurry = flurry.next) {
    console.log({brite, briteFactor: flurry.briteFactor});
    GLRenderScene(global, flurry, brite * flurry.briteFactor);
  }

  // TODO
  // if (mi.fps_p) do_fps (mi);

  // TODO
  // gl.finish();
  // gl.xSwapBuffers(display, window);

  global.frameCounter++;
}
