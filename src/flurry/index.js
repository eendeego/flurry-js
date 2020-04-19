/* flurry */

// @flow

import type {PresetsType} from './presets';
import type {FlurryInfo, GlobalInfo} from './types';

import ColorModes from './color-modes';
import {DRAW_SPARKS} from './constants';
import {createFlurry} from './flurry-info';
import {Presets} from './presets';
import {drawSmoke, updateSmoke} from './smoke';
import {drawSpark, updateSpark} from './spark';
// import {drawSpark, updateSpark, initSparkBuffers} from "./spark";
import {updateStar} from './star';
import {makeTexture} from './texture';

export function currentTime(): number {
  return Date.now() * 0.001;
}

function drawFlurry(global: GlobalInfo, flurry: FlurryInfo, b: number): void {
  flurry.dframe++;

  flurry.fOldTime = flurry.fTime;
  flurry.fTime = global.timeInSecondsSinceStart + flurry.flurryRandomSeed;
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
    updateSpark(global, flurry, flurry.spark[i]);

    // #ifdef DRAW_SPARKS
    if (DRAW_SPARKS) {
      drawSpark(global, flurry, flurry.spark[i]);
    }
  }
  updateSmoke(global, flurry, flurry.s);

  drawSmoke(global, flurry, flurry.s, b);
}

function flurriesFromPreset(
  global: GlobalInfo,
  preset: PresetsType,
): Array<FlurryInfo> {
  /**
   * createFlurry arguments:
   *   global: GlobalInfo,
   *   streams: number,
   *   colour: ColorModesType,
   *   thickness: number,
   *   speed: number,
   *   bf: number,
   */
  switch (preset) {
    case Presets.WATER:
      return Array.from({length: 9}, () =>
        createFlurry(global, 1, ColorModes.blueColorMode, 100.0, 2.0, 2.0),
      );
    case Presets.FIRE:
      return [
        createFlurry(
          global,
          12,
          ColorModes.slowCyclicColorMode,
          10000.0,
          0.2,
          1.0,
        ),
      ];
    case Presets.PSYCHEDELIC:
      return [
        createFlurry(global, 10, ColorModes.rainbowColorMode, 200.0, 2.0, 1.0),
      ];
    case Presets.RGB:
      return [
        createFlurry(global, 3, ColorModes.blueColorMode, 100.0, 0.8, 1.0),
        createFlurry(global, 3, ColorModes.greenColorMode, 100.0, 0.8, 1.0),
        createFlurry(global, 3, ColorModes.redColorMode, 100.0, 0.8, 1.0),
      ];
    case Presets.BINARY:
      return [
        createFlurry(global, 16, ColorModes.tiedyeColorMode, 1000.0, 1.5, 1.0),
        createFlurry(global, 16, ColorModes.tiedyeColorMode, 1000.0, 0.5, 1.0),
      ];
    case Presets.CLASSIC:
      return [
        createFlurry(global, 5, ColorModes.tiedyeColorMode, 10000.0, 1.0, 1.0),
      ];
    case Presets.INSANE:
      return [
        createFlurry(global, 64, ColorModes.tiedyeColorMode, 1000.0, 0.5, 0.5),
      ];

    default: {
      console.log(`unknown preset ${preset}`);
      throw new Error(`unknown preset ${preset}`);
    }
  }
}

// TODO add physical config argument
export function initFlurries(global: GlobalInfo, preset: PresetsType) {
  global.startTime = currentTime();
  global.oldFrameTime = -1;

  // For a later day
  // if (preset === Presets.RANDOM) {
  //   return ((Math.round(Math.random() * Presets.MAX): any): PresetsType);
  // }

  global.flurries = flurriesFromPreset(global, preset);
}

export function renderScene(global: GlobalInfo): void {
  const gl = global.gl;

  let deltaFrameTime = 0;
  let alpha;

  const newFrameTime = currentTime();
  global.timeInSecondsSinceStart = newFrameTime - global.startTime;
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
    deltaFrameTime = newFrameTime - global.oldFrameTime;
    // Typical values will be ~ 5/60 = 0.083
    alpha = Math.min(5.0 * deltaFrameTime, 0.2);
  }
  global.oldFrameTime = newFrameTime;

  if (global.frameCounter === 0) {
    // TODO Move this to init
    global.texid = makeTexture(gl);
  }

  gl.enable(gl.BLEND);
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.clearColor(0.0, 0.0, 0.0, alpha);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // const brite = Math.pow(deltaFrameTime, 0.75) * 10;
  const brite = Math.pow(deltaFrameTime, 0.75) * 10 * 5; // <= lmreis this 5 is mine

  for (const flurry of global.flurries) {
    drawFlurry(global, flurry, brite * flurry.briteFactor);
  }

  global.frameCounter++;
}
