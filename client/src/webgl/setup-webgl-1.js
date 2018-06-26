import { compileShader, createProgram } from './boilerplate'

let vShaderQuellcode = require('./shaders/shader-vs.glsl')
let fShaderQuellcode = require('./shaders/shader-fs.glsl')

let debug = true

function getWebglContext(canvas) {
  let gl = null
  const names = [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ];
  for (let i = 0; i < names.length; i++) {
    try {
      gl = canvas.getContext(names[i]);
      if (gl) { break; }
    } catch (e) {
      console.error(e);
    }
  }
  return gl
}

function getShaderVariables(gl, program) {
  const posAtrLoc = gl.getAttribLocation(program, "vPos");
  gl.enableVertexAttribArray( posAtrLoc );
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  let vertices = new Float32Array([1, 1,-1, 1,
                                   1,-1,-1,-1]);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(posAtrLoc, 2, gl.FLOAT, false, 0, 0);

  let dataLoc = gl.getUniformLocation(program, "data");
  let hash1Loc = gl.getUniformLocation(program, "hash1");
  let midstateLoc = gl.getUniformLocation(program, "midstate");
  let targetLoc = gl.getUniformLocation(program, "target");
  let nonceLoc = gl.getUniformLocation(program, "nonce_base");

  let hLoc = gl.getUniformLocation(program, "H");
  let kLoc = gl.getUniformLocation(program, "K");

  return {
    dataLoc,
    hash1Loc,
    midstateLoc,
    targetLoc,
    nonceLoc,
    hLoc,
    kLoc,
  };
}

export default function setupWebgl(threads) {
  let canvas = document.createElement('canvas')
  if (debug || true) document.body.appendChild(canvas)
  canvas.height = 1
  canvas.width = threads

  let gl = getWebglContext(canvas)
  if (gl === null)
    return false;

  let vShader = compileShader(gl, vShaderQuellcode, gl.VERTEX_SHADER)
  let fShader = compileShader(gl, fShaderQuellcode, gl.FRAGMENT_SHADER)

  let program = createProgram(gl, vShader, fShader)
}
