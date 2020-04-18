// enum defined in flurry.h

// @flow

const OptimizationModes = Object.freeze({
  OPT_MODE_SCALAR_BASE: 0x0,
  OPT_MODE_SCALAR_FRSQRTE: 0x1,
  OPT_MODE_VECTOR_SIMPLE: 0x2,
  OPT_MODE_VECTOR_UNROLLED: 0x3,
});

export type OptimizationModesType = $Values<typeof OptimizationModes>;

export default OptimizationModes;
