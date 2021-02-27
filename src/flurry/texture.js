/*
 *  Texture.c
 *  AppleFlurry
 *
 *  Created by calumr on Sat Jul 07 2001.
 *  Copyright (c) 2001 __CompanyName__. All rights reserved.
 *
 */

// @flow strict

import {initTexture} from '../webgl/seraphim-textures';
import {random} from './random';

function fNum(num: number): string {
  const s = num.toString(16);
  return num < 16 ? ' ' + s : s;
}

export function dumpSmallTexture(smallTextureArray: Uint8ClampedArray): void {
  let s = [];
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      s.push(fNum(smallTextureArray[i * 32 + j]));
    }
    s.push('--\n');
  }
  console.log(' ' + s.join(' '));
}

export function dumpBigTexture(bigTextureArray: Uint8ClampedArray): void {
  let s = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      for (let k = 0; k < 32; k++) {
        for (let l = 0; l < 32; l++) {
          s.push(
            fNum(bigTextureArray[(i * 32 + k) * 256 * 2 + (j * 32 + l) * 2]),
          );
        }
        s.push('--\n');
      }
      console.log(' ' + s.join(' '));
      s.length = 0;
    }
  }
}

/* simple smoothing routine */
function smoothTexture(smallTextureArray: Uint8ClampedArray) {
  const filter = new Uint8ClampedArray(32 * 32);
  for (let i = 1; i < 31; i++) {
    for (let j = 1; j < 31; j++) {
      let t = smallTextureArray[32 * i + j] * 4.0;
      t += smallTextureArray[32 * (i - 1) + j] * 1.0;
      t += smallTextureArray[32 * (i + 1) + j] * 1.0;
      t += smallTextureArray[32 * i + j - 1] * 1.0;
      t += smallTextureArray[32 * i + j + 1] * 1.0;
      t /= 8.0;
      filter[32 * i + j] = t;
    }
  }

  for (let i = 1; i < 31; i++) {
    for (let j = 1; j < 31; j++) {
      smallTextureArray[32 * i + j] = filter[32 * i + j];
    }
  }
}

/* add some randomness to texture data */
function speckleTexture(smallTextureArray: Uint8ClampedArray) {
  let speck;
  let t;
  for (let i = 2; i < 30; i++) {
    for (let j = 2; j < 30; j++) {
      speck = 1;
      while (speck <= 32 && random() < 0.5) {
        t = Math.min(255, smallTextureArray[32 * i + j] + speck);
        smallTextureArray[32 * i + j] = t;
        speck += speck;
      }
      speck = 1;
      while (speck <= 32 && random() < 0.5) {
        t = Math.max(0, smallTextureArray[32 * i + j] - speck);
        smallTextureArray[32 * i + j] = t;
        speck += speck;
      }
    }
  }
}

function makeSmallTexture(
  smallTextureArray: Uint8ClampedArray,
  firstRun: boolean,
) {
  let r, t;
  if (firstRun) {
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 32; j++) {
        r = Math.hypot(i - 15.5, j - 15.5);
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
        r = Math.hypot(i - 15.5, j - 15.5);
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
  speckleTexture(smallTextureArray);
  smoothTexture(smallTextureArray);
  smoothTexture(smallTextureArray);
}

function copySmallTextureToBigTexture(
  bigTextureArray: Uint8ClampedArray,
  smallTextureArray: Uint8ClampedArray,
  k: number,
  l: number,
): void {
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      bigTextureArray[32 * 8 * 2 * (i + k) + 2 * (j + l) + 0] =
        smallTextureArray[32 * i + j];
      bigTextureArray[32 * 8 * 2 * (i + k) + 2 * (j + l) + 1] =
        smallTextureArray[32 * i + j];
    }
  }
}

function averageLastAndFirstTextures(
  bigTextureArray: Uint8ClampedArray,
  smallTextureArray: Uint8ClampedArray,
) {
  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      const t =
        (smallTextureArray[32 * i + j] +
          bigTextureArray[32 * 8 * 2 * i + 2 * j + 0]) /
        2;
      smallTextureArray[32 * i + j] = Math.min(255, t);
    }
  }
}

export function createTexture(gl: WebGLRenderingContext): WebGLTexture {
  const smallTextureArray = new Uint8ClampedArray(32 * 32);
  const bigTextureArray = new Uint8ClampedArray(256 * 256 * 2);

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (i === 7 && j === 7) {
        averageLastAndFirstTextures(bigTextureArray, smallTextureArray);
      } else {
        makeSmallTexture(smallTextureArray, i === 0 && j === 0);
      }
      copySmallTextureToBigTexture(
        bigTextureArray,
        smallTextureArray,
        i * 32,
        j * 32,
      );
    }
  }

  return initTexture(gl, bigTextureArray);
}
