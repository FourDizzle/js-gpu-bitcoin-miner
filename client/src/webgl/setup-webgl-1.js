import { compileShader, createProgram } from './boilerplate'
import { nonceToUint16Array, hexToUint16Array, reverseAllBytes } from '../hexutil'

var h =  [0x6a09, 0xe667, 0xbb67, 0xae85, 0x3c6e, 0xf372, 0xa54f, 0xf53a,
          0x510e, 0x527f, 0x9b05, 0x688c, 0x1f83, 0xd9ab, 0x5be0, 0xcd19];

var k =  [0x428a, 0x2f98, 0x7137, 0x4491, 0xb5c0, 0xfbcf, 0xe9b5, 0xdba5,
          0x3956, 0xc25b, 0x59f1, 0x11f1, 0x923f, 0x82a4, 0xab1c, 0x5ed5,
          0xd807, 0xaa98, 0x1283, 0x5b01, 0x2431, 0x85be, 0x550c, 0x7dc3,
          0x72be, 0x5d74, 0x80de, 0xb1fe, 0x9bdc, 0x06a7, 0xc19b, 0xf174,
          0xe49b, 0x69c1, 0xefbe, 0x4786, 0x0fc1, 0x9dc6, 0x240c, 0xa1cc,
          0x2de9, 0x2c6f, 0x4a74, 0x84aa, 0x5cb0, 0xa9dc, 0x76f9, 0x88da,
          0x983e, 0x5152, 0xa831, 0xc66d, 0xb003, 0x27c8, 0xbf59, 0x7fc7,
          0xc6e0, 0x0bf3, 0xd5a7, 0x9147, 0x06ca, 0x6351, 0x1429, 0x2967,
          0x27b7, 0x0a85, 0x2e1b, 0x2138, 0x4d2c, 0x6dfc, 0x5338, 0x0d13,
          0x650a, 0x7354, 0x766a, 0x0abb, 0x81c2, 0xc92e, 0x9272, 0x2c85,
          0xa2bf, 0xe8a1, 0xa81a, 0x664b, 0xc24b, 0x8b70, 0xc76c, 0x51a3,
          0xd192, 0xe819, 0xd699, 0x0624, 0xf40e, 0x3585, 0x106a, 0xa070,
          0x19a4, 0xc116, 0x1e37, 0x6c08, 0x2748, 0x774c, 0x34b0, 0xbcb5,
          0x391c, 0x0cb3, 0x4ed8, 0xaa4a, 0x5b9c, 0xca4f, 0x682e, 0x6ff3,
          0x748f, 0x82ee, 0x78a5, 0x636f, 0x84c8, 0x7814, 0x8cc7, 0x0208,
          0x90be, 0xfffa, 0xa450, 0x6ceb, 0xbef9, 0xa3f7, 0xc671, 0x78f2];

let debug = false

function getWebglContext(canvas) {
  let gl = null
  const names = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
  for (let i = 0; i < names.length; i++) {
    try {
      gl = canvas.getContext(names[i], { antialias: false, });
      if (gl) { break; }
    } catch (e) {
      console.error(e);
    }
  }
  console.log(gl)
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

  gl.uniform2fv(hLoc, h);
  gl.uniform2fv(kLoc, k);

  return {
    dataLoc,
    hash1Loc,
    midstateLoc,
    targetLoc,
    nonceLoc,
  };
}

export default function setupWebgl(threads, shaders, options) {
  // let debug = options.debug || false
  options = options || {}
  options.debug = options.debug || false
  debug = options.debug

  let glMiner = {
    threads,
    options,
  }

  let canvas = document.createElement('canvas')
  canvas.height = 1
  canvas.width = threads
  canvas.style = 'width: ' + threads + 'px; height: 1px'
  canvas.id = 'webgl-miner'

  if (debug) document.body.appendChild(canvas)

  glMiner.canvas = canvas

  let gl = getWebglContext(canvas)
  if (gl === null)
    return false;

  glMiner.gl = gl

  let vShader = compileShader(gl, shaders.vShader, gl.VERTEX_SHADER)
  let fShader = compileShader(gl, shaders.fShader, gl.FRAGMENT_SHADER)

  let program = createProgram(gl, vShader, fShader)
  gl.linkProgram(program)
  gl.useProgram(program)

  gl.clearColor( 1.0, 1.0, 1.0, 1.0 )
  gl.clear(gl.COLOR_BUFFER_BIT)

  let shaderParams = getShaderVariables(gl, program)

  glMiner.buf = new Uint8Array(canvas.width * canvas.height * 4)

  glMiner.addWork = function(work) {
    console.log(work)
    console.log('target', hexToUint16Array(reverseAllBytes(work.target)))
    gl.uniform2fv(shaderParams.dataLoc, hexToUint16Array(work.data))
    gl.uniform2fv(shaderParams.hash1Loc, hexToUint16Array(work.hash1))
    gl.uniform2fv(shaderParams.midstateLoc, hexToUint16Array(work.midstate))
    gl.uniform2fv(shaderParams.targetLoc, hexToUint16Array(reverseAllBytes(work.target)))
    glMiner.updateNonce(work.nonceStart)
  }

  glMiner.updateNonce = function(nonce) {
    glMiner.nonce = nonce
    gl.uniform2fv(shaderParams.nonceLoc, nonceToUint16Array(nonce))
  }

  glMiner.mine = function() {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.readPixels(0, 0, this.threads, 1, gl.RGBA, gl.UNSIGNED_BYTE, glMiner.buf)
    this.updateNonce(this.nonce + this.threads)
  }

  console.log('webgl miner setup!')
  return glMiner;
}
