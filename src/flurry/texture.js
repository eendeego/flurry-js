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

// static GLubyte smallTextureArray[32][32];
// static GLubyte bigTextureArray[256][256][2];
const smallTextureArray = new Uint8ClampedArray(32 * 32 * 2);
const bigTextureArray = new Uint8ClampedArray(256 * 256 * 2);

/* simple smoothing routine */
function smoothTexture() {
  for (let i = 1; i < 31; i++) {
    for (let j = 1; j < 31; j++) {
      let t = smallTextureArray[32 * i + j] * 4;
      t += smallTextureArray[32 * (i - 1) + j];
      t += smallTextureArray[32 * (i + 1) + j];
      t += smallTextureArray[32 * i + j - 1];
      t += smallTextureArray[32 * i + j + 1];
      t /= 8.0;
      smallTextureArray[32 * 32 + 32 * i + j] = t;
    }
  }

  smallTextureArray.copyWithin(0, 32 * 32);
}

/* add some randomness to texture data */
function speckleTexture() {
  let speck;
  let t;
  for (let i = 2; i < 30; i++) {
    for (let j = 2; j < 30; j++) {
      speck = 1;
      while (speck <= 32 && Math.random() < 0.5) {
        t = Math.min(255, smallTextureArray[32 * i + j] + speck);
        smallTextureArray[32 * i + j] = t;
        speck += speck;
      }
      speck = 1;
      while (speck <= 32 && Math.random() < 0.5) {
        t = Math.max(0, smallTextureArray[32 * i + j] - speck);
        smallTextureArray[32 * i + j] = t;
        speck += speck;
      }
    }
  }
}

let makeSmallTextureFirstTime = true;
function makeSmallTexture() {
  let r, t;
  if (makeSmallTextureFirstTime) {
    makeSmallTextureFirstTime = false;
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        r = Math.sqrt((i - 15.5) * (i - 15.5) + (j - 15.5) * (j - 15.5));
        if (r > 15.0) {
          smallTextureArray[32 * i + j] = 0;
        } else {
          t = 255.0 * Math.cos((r * Math.PI) / 31.0);
          smallTextureArray[32 * i + j] = t;
        }
      }
    }
  } else {
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        r = Math.sqrt((i - 15.5) * (i - 15.5) + (j - 15.5) * (j - 15.5));
        if (r > 15.0) {
          t = 0.0;
        } else {
          t = 255.0 * Math.cos((r * Math.PI) / 31.0);
        }
        smallTextureArray[32 * i + j] = Math.min(
          255,
          (t + smallTextureArray[32 * i + j] + smallTextureArray[32 * i + j]) /
            3,
        );
      }
    }
  }
  speckleTexture();
  smoothTexture();
  smoothTexture();
}

function copySmallTextureToBigTexture(k: number, l: number): void {
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      bigTextureArray[32 * 2 * (i + k) + 2 * (j + l) + 0] =
        smallTextureArray[32 * i + j];
      bigTextureArray[32 * 2 * (i + k) + 2 * (j + l) + 1] =
        smallTextureArray[32 * i + j];
    }
  }
}

function averageLastAndFirstTextures() {
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      const t =
        (smallTextureArray[32 * i + j] +
          bigTextureArray[32 * 2 * i + 2 * j + 0]) /
        2;
      smallTextureArray[32 * i + j] = Math.min(255, t);
    }
  }
}

//: GLuint
export function makeTexture(gl: WebGLRenderingContext): number {
  //   GLuint theTexture = 0;
  let theTexture = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (i === 7 && j === 7) {
        averageLastAndFirstTextures();
      } else {
        makeSmallTexture();
      }
      copySmallTextureToBigTexture(i * 32, j * 32);
    }
  }

  // // TODO
  // gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

  // gl.genTextures(1, theTexture);
  // gl.bindTexture(gl.TEXTURE_2D, theTexture);

  // /* Set the tiling mode (this is generally always GL_REPEAT). */
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // /* Set the filtering. */
  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // gl.texParameteri(
  //   gl.TEXTURE_2D,
  //   gl.TEXTURE_MIN_FILTER,
  //   gl.LINEAR_MIPMAP_NEAREST,
  // );

  // glu.Build2DMipmaps(
  //   gl.TEXTURE_2D,
  //   2,
  //   256,
  //   256,
  //   gl.LUMINANCE_ALPHA,
  //   gl.UNSIGNED_BYTE,
  //   bigTextureArray,
  // );
  // gl.texEnvf(gl.TEXTURE_ENV, gl.TEXTURE_ENV_MODE, gl.MODULATE);

  return theTexture;
}
