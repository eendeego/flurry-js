// @flow strict

export function randFlt(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randBell(scale: number): number {
  return scale * (1.0 - (Math.random() + Math.random() + Math.random()) / 1.5);
}
