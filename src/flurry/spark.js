/* Spark.cpp: implementation of the Spark class. */

// @flow

import type {FlurryInfo, GlobalInfo, Spark} from './types';

import ColorModes from './color-modes';
import {BIGMYSTERY, MAXANGLES} from './constants';
import {mat4} from 'gl-matrix';
import nullthrows from 'nullthrows';
import {random, randBell, randFlt} from './random';
// import {initBuffer} from "../webgl/buffers";
// import {initShaderProgram} from "../webgl/shaders";

export function createSpark(): Spark {
  return {
    position: Array.from({length: 4}, (_, i) => randFlt(-100.0, 100.0)),
    mystery: 0,
    delta: [0, 0, 0],
    color: [0, 0, 0, 0],
  };
}

export function drawSpark(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: Spark,
): void {
  const {gl} = global;
  const spark = nullthrows(global.debug?.spark);
  const modelViewMatrix = mat4.create();
  const projectionMatrix = mat4.create();

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  {
    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = global.width / global.height;
    const zNear = 0.1;
    const zFar = 100.0;
    // const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
  }

  // TODO Move to shader
  // const black = [0.0, 0.0, 0.0, 1.0];
  const c = 0.0625;
  {
    const width = (60000.0 * global.width) / 1024.0;

    const z = s.position[2];
    const sx = (s.position[0] * global.width) / z + global.width * 0.5;
    const sy = (s.position[1] * global.width) / z + global.height * 0.5;
    const w = (width * 4.0) / z;

    const screenx = sx;
    const screeny = sy;

    // // TODO
    // gl.pushMatrix();
    // gl.translatef(screenx, screeny, 0.0);
    const scale = w / 50.0;
    // gl.scalef(scale, scale, 0.0);

    console.log({screenx, screeny, scale});

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    // const modelViewMatrix = mat4.create();

    // Now move the drawing position a bit to where we want to
    // start drawing the square.

    mat4.translate(
      modelViewMatrix, // destination matrix
      modelViewMatrix, // matrix to translate
      [0, 0, -6.0], // amount to translate
    );
    // mat4.translate(
    //   modelViewMatrix, // destination matrix
    //   modelViewMatrix, // matrix to translate
    //   [screenx, screeny, -6.0], // amount to translate
    // );
    // mat4.scale(
    //   modelViewMatrix, // destination matrix
    //   modelViewMatrix, // matrix to translate
    //   [scale, scale, 0], // amount to translate
    // );
  }

  for (let k = 0; k < 12; k++) {
    let a = Math.floor(random() * 3600) / 10.0;
    // TODO
    // gl.rotatef(a, 0.0, 0.0, 1.0);
    // gl.begin(gl.QUAD_STRIP);
    // gl.color4fv(black);
    // gl.vertex2f(-3.0, 0.0);
    spark.vertices[0] = -3.0;
    spark.vertices[1] = 0.0;
    a = 2.0 + Math.floor(random() * 256) * c;
    // gl.vertex2f(-3.0, a);
    spark.vertices[2] = -3.0;
    spark.vertices[3] = a;
    // {
    //   const offset = 0;
    //   const vertexCount = 2;
    //   gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    // }

    // TODO
    // gl.color4fv(s.color);
    spark.vertices[4] = 0.0;
    spark.vertices[5] = 0.0;
    // gl.vertex2f(0.0, 0.0);
    // gl.color4fv(black);
    // gl.vertex2f(0.0, a);
    // gl.vertex2f(3.0, 0.0);
    // gl.vertex2f(3.0, a);
    spark.vertices[6] = 0.0;
    spark.vertices[7] = a;
    spark.vertices[8] = 3.0;
    spark.vertices[9] = 0.0;
    spark.vertices[10] = 3.0;
    spark.vertices[11] = a;
    // gl.end();

    {
      let ii = 0;
      spark.vertices[ii++] = -1.0;
      spark.vertices[ii++] = -1.0;
      spark.vertices[ii++] = -1.0;
      spark.vertices[ii++] = 1.0;
      spark.vertices[ii++] = -1.0;
      spark.vertices[ii++] = 1.0;
      spark.vertices[ii++] = -1.0;
      spark.vertices[ii++] = 1.0;
    }
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    {
      const numComponents = 2;
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.bindBuffer(gl.ARRAY_BUFFER, spark.verticesBuffer);
      gl.vertexAttribPointer(
        spark.programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
      );
      gl.enableVertexAttribArray(
        spark.programInfo.attribLocations.vertexPosition,
      );
    }

    // Tell WebGL to use our program when drawing

    gl.useProgram(spark.programInfo.program);

    // Set the shader uniforms

    gl.uniformMatrix4fv(
      spark.programInfo.uniformLocations.projectionMatrix,
      false, // no transpose
      projectionMatrix,
    );
    gl.uniformMatrix4fv(
      spark.programInfo.uniformLocations.modelViewMatrix,
      false, // no transpose
      modelViewMatrix,
    );
    {
      const offset = 0;
      const vertexCount = 6;
      gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
  }
  // gl.popMatrix();
}

export function updateSparkColour(
  global: GlobalInfo,
  flurry: FlurryInfo,
  s: Spark,
): void {
  const {smokeParameters} = global;

  const rotationsPerSecond =
    (2.0 * Math.PI * smokeParameters.fieldSpeed) / MAXANGLES;
  const thisAngle = flurry.fTime * rotationsPerSecond;
  let cycleTime = 20.0;
  let baseRed;
  let baseGreen;
  let baseBlue;

  if (flurry.currentColorMode === ColorModes.rainbow) {
    cycleTime = 1.5;
  } else if (flurry.currentColorMode === ColorModes.tiedye) {
    cycleTime = 4.5;
  } else if (flurry.currentColorMode === ColorModes.cyclic) {
    cycleTime = 20.0;
  } else if (flurry.currentColorMode === ColorModes.slowCyclic) {
    cycleTime = 120.0;
  }
  const colorRot = (2.0 * Math.PI) / cycleTime;
  const redPhaseShift = 0.0; /* cycleTime * 0.0f / 3.0f */
  const greenPhaseShift = cycleTime / 3.0;
  const bluePhaseShift = (cycleTime * 2.0) / 3.0;
  let colorTime = flurry.fTime;
  if (flurry.currentColorMode === ColorModes.white) {
    baseRed = 0.1875;
    baseGreen = 0.1875;
    baseBlue = 0.1875;
  } else if (flurry.currentColorMode === ColorModes.multi) {
    baseRed = 0.0625;
    baseGreen = 0.0625;
    baseBlue = 0.0625;
  } else if (flurry.currentColorMode === ColorModes.dark) {
    baseRed = 0.0;
    baseGreen = 0.0;
    baseBlue = 0.0;
  } else {
    if (flurry.currentColorMode < ColorModes.slowCyclic) {
      colorTime = (flurry.currentColorMode / 6.0) * cycleTime;
    } else {
      colorTime = flurry.fTime + flurry.flurryRandomSeed;
    }
    baseRed =
      0.109375 * (Math.cos((colorTime + redPhaseShift) * colorRot) + 1.0);
    baseGreen =
      0.109375 * (Math.cos((colorTime + greenPhaseShift) * colorRot) + 1.0);
    baseBlue =
      0.109375 * (Math.cos((colorTime + bluePhaseShift) * colorRot) + 1.0);
  }

  // cf is unused in original source
  // let cf =
  //   Math.cos(7.0 * (flurry.fTime * rotationsPerSecond)) +
  //   Math.cos(3.0 * (flurry.fTime * rotationsPerSecond)) +
  //   Math.cos(13.0 * (flurry.fTime * rotationsPerSecond));
  // cf /= 6.0;
  // cf += 2.0;
  const thisPointInRadians = (2.0 * Math.PI * s.mystery) / BIGMYSTERY;

  s.color[0] =
    baseRed +
    0.0625 *
      (0.5 +
        Math.cos(15.0 * (thisPointInRadians + 3.0 * thisAngle)) +
        Math.sin(7.0 * (thisPointInRadians + thisAngle)));
  s.color[1] =
    baseGreen + 0.0625 * (0.5 + Math.sin(thisPointInRadians + thisAngle));
  s.color[2] =
    baseBlue +
    0.0625 * (0.5 + Math.cos(37.0 * (thisPointInRadians + thisAngle)));
}

export function updateSpark(
  smokeParameters: SmokeParameters,
  flurry: FlurryInfo,
  s: Spark,
) {
  const rotationsPerSecond =
    (2.0 * Math.PI * smokeParameters.fieldSpeed) / MAXANGLES;
  const thisAngle = flurry.fTime * rotationsPerSecond;
  let cycleTime = 20.0;
  let baseRed;
  let baseGreen;
  let baseBlue;

  let old = new Array(3);

  if (flurry.currentColorMode === ColorModes.rainbow) {
    cycleTime = 1.5;
  } else if (flurry.currentColorMode === ColorModes.tiedye) {
    cycleTime = 4.5;
  } else if (flurry.currentColorMode === ColorModes.cyclic) {
    cycleTime = 20.0;
  } else if (flurry.currentColorMode === ColorModes.slowCyclic) {
    cycleTime = 120.0;
  }
  const colorRot = (2.0 * Math.PI) / cycleTime;
  const redPhaseShift = 0.0; /* cycleTime * 0.0f / 3.0f */
  const greenPhaseShift = cycleTime / 3.0;
  const bluePhaseShift = (cycleTime * 2.0) / 3.0;
  let colorTime = flurry.fTime;
  if (flurry.currentColorMode === ColorModes.white) {
    baseRed = 0.1875;
    baseGreen = 0.1875;
    baseBlue = 0.1875;
  } else if (flurry.currentColorMode === ColorModes.multi) {
    baseRed = 0.0625;
    baseGreen = 0.0625;
    baseBlue = 0.0625;
  } else if (flurry.currentColorMode === ColorModes.dark) {
    baseRed = 0.0;
    baseGreen = 0.0;
    baseBlue = 0.0;
  } else {
    if (flurry.currentColorMode < ColorModes.slowCyclic) {
      colorTime = (flurry.currentColorMode / 6.0) * cycleTime;
    } else {
      colorTime = flurry.fTime + flurry.flurryRandomSeed;
    }

    baseRed =
      0.109375 * (Math.cos((colorTime + redPhaseShift) * colorRot) + 1.0);
    baseGreen =
      0.109375 * (Math.cos((colorTime + greenPhaseShift) * colorRot) + 1.0);
    baseBlue =
      0.109375 * (Math.cos((colorTime + bluePhaseShift) * colorRot) + 1.0);
  }

  for (let i = 0; i < 3; i++) {
    old[i] = s.position[i];
  }

  let cf =
    Math.cos(7.0 * (flurry.fTime * rotationsPerSecond)) +
    Math.cos(3.0 * (flurry.fTime * rotationsPerSecond)) +
    Math.cos(13.0 * (flurry.fTime * rotationsPerSecond));
  cf /= 6.0;
  cf += 2.0;
  const thisPointInRadians = (2.0 * Math.PI * s.mystery) / BIGMYSTERY;

  s.color[0] =
    baseRed +
    0.0625 *
      (0.5 +
        Math.cos(15.0 * (thisPointInRadians + 3.0 * thisAngle)) +
        Math.sin(7.0 * (thisPointInRadians + thisAngle)));
  s.color[1] =
    baseGreen + 0.0625 * (0.5 + Math.sin(thisPointInRadians + thisAngle));
  s.color[2] =
    baseBlue +
    0.0625 * (0.5 + Math.cos(37.0 * (thisPointInRadians + thisAngle)));

  s.position[0] =
    smokeParameters.fieldRange *
    cf *
    Math.cos(11.0 * (thisPointInRadians + 3.0 * thisAngle));
  s.position[1] =
    smokeParameters.fieldRange *
    cf *
    Math.sin(12.0 * (thisPointInRadians + 4.0 * thisAngle));
  s.position[2] =
    smokeParameters.fieldRange *
    Math.cos(23.0 * (thisPointInRadians + 12.0 * thisAngle));

  let rotation = thisAngle * 0.501 + (5.01 * s.mystery) / BIGMYSTERY;
  let cr = Math.cos(rotation);
  let sr = Math.sin(rotation);

  const tmpX1 = s.position[0] * cr - s.position[1] * sr;
  const tmpY1 = s.position[1] * cr + s.position[0] * sr;
  const tmpZ1 = s.position[2];

  const tmpX2 = tmpX1 * cr - tmpZ1 * sr;
  const tmpY2 = tmpY1;
  const tmpZ2 = tmpZ1 * cr + tmpX1 * sr;

  const tmpX3 = tmpX2;
  const tmpY3 = tmpY2 * cr - tmpZ2 * sr;
  const tmpZ3 = tmpZ2 * cr + tmpY2 * sr + smokeParameters.seraphDistance;

  rotation = thisAngle * 2.501 + (85.01 * s.mystery) / BIGMYSTERY;
  cr = Math.cos(rotation);
  sr = Math.sin(rotation);
  let tmpX4 = tmpX3 * cr - tmpY3 * sr;
  const tmpY4 = tmpY3 * cr + tmpX3 * sr;
  const tmpZ4 = tmpZ3;

  s.position[0] = tmpX4 + randBell(5.0 * smokeParameters.fieldCoherence);
  s.position[1] = tmpY4 + randBell(5.0 * smokeParameters.fieldCoherence);
  s.position[2] = tmpZ4 + randBell(5.0 * smokeParameters.fieldCoherence);

  for (let i = 0; i < 3; i++) {
    s.delta[i] = (s.position[i] - old[i]) / flurry.fDeltaTime;
  }
}

// export function initSparkBuffers(global: GlobalInfo): void {
//   const gl = global.gl;

//   const program = initShaderProgram(global.gl);

//   const programInfo = {
//     program,
//     attribLocations: {
//       vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
//       vertexColor: gl.getAttribLocation(program, "aVertexColor"),
//     },
//     uniformLocations: {
//       projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
//       modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
//     },
//   };

//   const vertices = new Float32Array(6 * 2);
//   const verticesBuffer = initBuffer(
//     global.gl,
//     gl.ARRAY_BUFFER,
//     vertices,
//     gl.STREAM_DRAW,
//   );

//   if (global.debug == null) {
//     global.debug = {};
//   }

//   global.debug.spark = {
//     vertices,
//     verticesBuffer,
//     programInfo,
//   };
// }
