// @flow

import type {GlobalInfo} from './types';

// TODO Move to a value inside global
export function timeInSecondsSinceStart(global: GlobalInfo): number {
  return currentTime() - global.gTimeCounter;
}

export function currentTime(): number {
  return Date.now() * 0.001;
}
