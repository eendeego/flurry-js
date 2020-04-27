// @flow strict

let seed = 42 + 0;

function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

export const random = true ? Math.random : seededRandom;

export function randFlt(min: number, max: number): number {
  return min + random() * (max - min);
}

export function randBell(scale: number): number {
  return scale * (1.0 - (random() + random() + random()) / 1.5);
}
