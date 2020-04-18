// @flow strict

const Deadness = Object.freeze({
  alive: 0,
  dead: 1,
  undead: 3, // NOT_QUITE_DEAD in flurry-smoke.c
});

export type DeadnessType = $Values<typeof Deadness>;

export default Deadness;
