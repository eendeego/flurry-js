// @flow strict

// Based on https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Adding_2D_content_to_a_WebGL_context

import type {ProgramInfo} from '../flurry/types';

// Vertex shader program
const vsSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  attribute vec4 aVertexColor;

  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  varying highp vec2 vTextureCoord;
  varying lowp vec4 vColor;

  void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vColor = aVertexColor;
  }
`;

// Fragment shader program
const fsSource = `
  varying highp vec2 vTextureCoord;
  varying lowp vec4 vColor;
  
  uniform sampler2D uSampler;

  void main() {
    // gl_FragColor = texture2D(uSampler, vTextureCoord);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor;

    // glAlphaFunc(GREATER, 0.0)
    // https://stackoverflow.com/questions/24302152/opengl-alpha-test-how-to-replace-alphafunc-deprecated
    if(gl_FragColor.a <= 0.0) {
      discard;
    }
  }
`;

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
export function loadShader(
  gl: WebGLRenderingContext,
  type: number, // GLEnum
  source: string,
): ?WebGLShader {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(
      'An error occurred compiling the shaders: ' +
        (gl.getShaderInfoLog(shader) ?? '<no log>'),
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
export function initShaderProgram(gl: WebGLRenderingContext): ?WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(
      'Unable to initialize the shader program: ' +
        (gl.getProgramInfoLog(shaderProgram) ?? '<no log>'),
    );
    return null;
  }

  return shaderProgram;
}

export function initShaders(gl: WebGLRenderingContext): ProgramInfo {
  const program = initShaderProgram(gl);

  return {
    program,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(program, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(program, 'aVertexColor'),
      textureCoord: gl.getAttribLocation(program, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(program, 'uSampler'),
    },
  };
}
