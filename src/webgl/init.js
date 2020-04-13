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

import type {GlobalInfo} from '../flurry/types';

import {DRAW_SPARKS} from '../flurry/flurry-h';

export function init(global: GlobalInfo): void {
  const gl = global.gl;
  /* setup the defaults for OpenGL */
  gl.disable(gl.DEPTH_TEST); // webgl-safe
  // // TODO
  // gl.alphaFunc(gl.GREATER, 0.0);
  // gl.enable(gl.ALPHA_TEST);
  // gl.shadeModel(gl.FLAT);
  // gl.disable(gl.LIGHTING);
  gl.disable(gl.CULL_FACE); // webgl-safe
  gl.enable(gl.BLEND); // webgl-safe
  gl.viewport(0, 0, global.sys_glWidth, global.sys_glHeight); // webgl-safe

  // // DONE - In drawSeraphim
  // gl.matrixMode(gl.PROJECTION);
  // gl.loadIdentity();
  // gl.ortho(0, global.sys_glWidth, 0, global.sys_glHeight, -1, 1);

  // // gl.matrixMode(gl.MODELVIEW);
  // // gl.loadIdentity();
  gl.clear(gl.COLOR_BUFFER_BIT); // webgl-safe

  // // DONE - No longer exists
  // gl.enableClientState(gl.COLOR_ARRAY);
  // gl.enableClientState(gl.VERTEX_ARRAY);
  // gl.enableClientState(gl.TEXTURE_COORD_ARRAY);

  // Buffer initialization is performed in initSmoke (called from initFlurry)

  if (DRAW_SPARKS) {
    // initSparkBuffers(global);
  }
}
