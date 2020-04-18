/* (Star.c:) implementation of the Star class. */

// @flow

import type {FlurryInfo, GlobalInfo, Star} from './types';
import {MAGIC} from './flurry-h';
import {randFlt} from './random';

export function initStar(rotSpeed?: number): Star {
  return {
    position: Array.from({length: 3}, (_, i) => randFlt(-10000.0, 10000.0)),
    mystery: randFlt(0.0, 10.0),
    rotSpeed: rotSpeed ?? randFlt(0.4, 0.9),
    ate: 0,
  };
}

const BIGMYSTERY = 1800.0;
const MAXANGLES = 16384;

export function updateStar(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: Star,
): void {
  const rotationsPerSecond =
    ((2.0 * Math.PI * 12.0) / MAXANGLES) * s.rotSpeed; /* speed control */
  let thisPointInRadians;
  const thisAngle = flurry.fTime * rotationsPerSecond;
  let cf;
  let tmpX1, tmpY1, tmpZ1;
  let tmpX2, tmpY2, tmpZ2;
  let tmpX3, tmpY3, tmpZ3;
  let tmpX4, tmpY4, tmpZ4;
  let rotation;
  let cr;
  let sr;

  s.ate = 0;

  cf =
    Math.cos(7.0 * (flurry.fTime * rotationsPerSecond)) +
    Math.cos(3.0 * (flurry.fTime * rotationsPerSecond)) +
    Math.cos(13.0 * (flurry.fTime * rotationsPerSecond));
  cf /= 6.0;
  cf += 0.75;
  thisPointInRadians = (2.0 * Math.PI * s.mystery) / BIGMYSTERY;

  s.position[0] =
    250.0 * cf * Math.cos(11.0 * (thisPointInRadians + 3.0 * thisAngle));
  s.position[1] =
    250.0 * cf * Math.sin(12.0 * (thisPointInRadians + 4.0 * thisAngle));
  s.position[2] =
    250.0 * Math.cos(23.0 * (thisPointInRadians + 12.0 * thisAngle));

  rotation = thisAngle * 0.501 + (5.01 * s.mystery) / BIGMYSTERY;
  cr = Math.cos(rotation);
  sr = Math.sin(rotation);
  tmpX1 = s.position[0] * cr - s.position[1] * sr;
  tmpY1 = s.position[1] * cr + s.position[0] * sr;
  tmpZ1 = s.position[2];

  tmpX2 = tmpX1 * cr - tmpZ1 * sr;
  tmpY2 = tmpY1;
  tmpZ2 = tmpZ1 * cr + tmpX1 * sr;

  tmpX3 = tmpX2;
  tmpY3 = tmpY2 * cr - tmpZ2 * sr;
  tmpZ3 = tmpZ2 * cr + tmpY2 * sr + MAGIC.seraphDistance;

  rotation = thisAngle * 2.501 + (85.01 * s.mystery) / BIGMYSTERY;
  cr = Math.cos(rotation);
  sr = Math.sin(rotation);
  tmpX4 = tmpX3 * cr - tmpY3 * sr;
  tmpY4 = tmpY3 * cr + tmpX3 * sr;
  tmpZ4 = tmpZ3;

  s.position[0] = tmpX4;
  s.position[1] = tmpY4;
  s.position[2] = tmpZ4;
}
