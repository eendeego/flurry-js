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

// @flow

export function fastDistance2D(x: number, y: number): number {
  /* this function computes the distance from 0,0 to x,y with ~3.5% error */
  let mn;
  /* first compute the absolute value of x,y */
  x = x < 0.0 ? -x : x;
  y = y < 0.0 ? -y : y;

  /* compute the minimum of x,y */
  mn = x < y ? x : y;

  /* return the distance */
  return x + y - mn * 0.5 - mn * 0.25 + mn * 0.0625;
}

export function randFlt(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
export function randBell(scale: number): number {
  return (
    scale * -(Math.random() * 0.5 + Math.random() * 0.5 + Math.random() * 0.5)
  );
}

export const NUMSMOKEPARTICLES = 3600;

export const MAGIC = {
  gravity: 1500000.0,

  incohesion: 0.07,
  colorIncoherence: 0.15,
  streamSpeed: 450.0,
  fieldCoherence: 0,
  fieldSpeed: 12,
  seraphDistance: 2000.0,
  streamSize: 25000.0,
  fieldRange: 1000.0,
  streamBias: 7.0,
};

export const MAX_SPARKS = 64;

export const DRAW_SPARKS = false;
