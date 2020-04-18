/* flurry */

// @flow

import type {PresetNumType} from './preset-num';
import type {FlurryInfo, GlobalInfo} from './types';

import ColorModes from './color-modes';
import {DEF_PRESET, DRAW_SPARKS} from './constants';
import {createFlurry} from './flurry-info';
import {PresetNum} from './preset-num';
import {drawSmoke, updateSmoke} from './smoke';
import {drawSpark, updateSpark} from './spark';
// import {drawSpark, updateSpark, initSparkBuffers} from "./spark";
import {updateStar} from './star';
import {makeTexture} from './texture';
import nullthrows from 'nullthrows';

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

  drawSmoke_Scalar(global, flurry, flurry.s, b);
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

function flurriesFromPreset(
  global: GlobalInfo,
  preset: PresetNumType,
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
    case PresetNum.PRESET_WATER:
      return Array.from({length: 9}, () =>
        createFlurry(global, 1, ColorModes.blueColorMode, 100.0, 2.0, 2.0),
      );
    case PresetNum.PRESET_FIRE:
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
    case PresetNum.PRESET_PSYCHEDELIC:
      return [
        createFlurry(global, 10, ColorModes.rainbowColorMode, 200.0, 2.0, 1.0),
      ];
    case PresetNum.PRESET_RGB:
      return [
        createFlurry(global, 3, ColorModes.blueColorMode, 100.0, 0.8, 1.0),
        createFlurry(global, 3, ColorModes.greenColorMode, 100.0, 0.8, 1.0),
        createFlurry(global, 3, ColorModes.redColorMode, 100.0, 0.8, 1.0),
      ];
    case PresetNum.PRESET_BINARY:
      return [
        createFlurry(global, 16, ColorModes.tiedyeColorMode, 1000.0, 1.5, 1.0),
        createFlurry(global, 16, ColorModes.tiedyeColorMode, 1000.0, 0.5, 1.0),
      ];
    case PresetNum.PRESET_CLASSIC:
      return [
        createFlurry(global, 5, ColorModes.tiedyeColorMode, 10000.0, 1.0, 1.0),
      ];
    case PresetNum.PRESET_INSANE:
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
export function initFlurry(global: GlobalInfo, presetStr: ?string) {
  global.startTime = currentTime();
  global.oldFrameTime = -1;

  const presetNum = presetStr2Num(presetStr);

  global.flurries = flurriesFromPreset(global, presetNum);

  //   if (init_GL(mi)) {
  reshapeFlurry(global);
  //   } else {
  //     // // TODO
  //     // MI_CLEARWINDOW(mi);
  //   }
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
