// @flow strict

import {Presets} from './presets';

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

export const BIGMYSTERY = 1800.0;
export const MAXANGLES = 16384;

export const DRAW_SPARKS = false;

export const DEF_PRESET = Presets.CLASSIC;
