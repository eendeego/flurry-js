// @flow strict

export function fastDistance2D(x: number, y: number): number {
  /* this function computes the distance from 0,0 to x,y with ~3.5% error */
  /* first compute the absolute value of x,y */
  const xx = x < 0.0 ? -x : x;
  const yy = y < 0.0 ? -y : y;

  /* compute the minimum of x,y */
  const mn = xx < yy ? xx : yy;

  /* return the distance */
  return xx + yy - mn * 0.5 - mn * 0.25 + mn * 0.0625;
}

export function randFlt(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randBell(scale: number): number {
  return scale * (1.0 - (Math.random() + Math.random() + Math.random()) / 1.5);
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
