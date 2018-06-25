const vShaderQuellcode = require('./shader-vs.glsl')
const fShaderQuellcode = require('./shader-fs.glsl')
const vShaderQuellcodeV2 = require('./shader-vs-2.glsl')
const fShaderQuellcodeV2 = require('./shader-fs-2.glsl')

const H = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

const K = [
   0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
   0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
   0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
   0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
   0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
   0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
   0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
   0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
   0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
   0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
   0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
   0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
   0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
   0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
   0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
   0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]

var dataLoc;
var hash1Loc;
var midstateLoc;
var targetLoc;
var nonceLoc;

var maxNonce = 0xFFFFFFFF;
var maxCnt = 0;
var reportPeriod = 1000;
var useTimeout = true;
var totalHashes = 0;
var gl;
var canvas;
var debug = false;
var buf;

var width;
var height;

function detectWebGLVersion() {
  return '2.0'
}

function createShader(type, code) {
  let shader = gl.createShader(type)
  gl.shaderSource(shader, code)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader))
  }
  return shader
}

function start(threads) {
  canvas = document.createElement('canvas');
  if (debug || true) document.body.appendChild(canvas)
  canvas.height = height = 1;
  canvas.width = width = threads;

  var names = [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ];
  for (var i=0; i<names.length; i++) {
    try {
        gl = canvas.getContext(names[i]);
        if (gl) { break; }
    } catch (e) { }
  }

  if (!gl) console.error('Missing WebGl')

  let program = gl.createProgram();

  let vShader = createShader(gl.VERTEX_SHADER, vShaderQuellcode)
  gl.attachShader(program, vShader)

  let fShader = createShader(gl.FRAGMENT_SHADER, fShaderQuellcode)
  gl.attachShader(program, fShader)

  gl.linkProgram(program)
  gl.useProgram(program)

  gl.clearColor(1.0, 1.0, 1.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT)

  var h =  [0x6a09, 0xe667, 0xbb67, 0xae85,
            0x3c6e, 0xf372, 0xa54f, 0xf53a,
            0x510e, 0x527f, 0x9b05, 0x688c,
            0x1f83, 0xd9ab, 0x5be0, 0xcd19]

  var k =  [0x428a, 0x2f98, 0x7137, 0x4491,
            0xb5c0, 0xfbcf, 0xe9b5, 0xdba5,
            0x3956, 0xc25b, 0x59f1, 0x11f1,
            0x923f, 0x82a4, 0xab1c, 0x5ed5,
            0xd807, 0xaa98, 0x1283, 0x5b01,
            0x2431, 0x85be, 0x550c, 0x7dc3,
            0x72be, 0x5d74, 0x80de, 0xb1fe,
            0x9bdc, 0x06a7, 0xc19b, 0xf174,
            0xe49b, 0x69c1, 0xefbe, 0x4786,
            0x0fc1, 0x9dc6, 0x240c, 0xa1cc,
            0x2de9, 0x2c6f, 0x4a74, 0x84aa,
            0x5cb0, 0xa9dc, 0x76f9, 0x88da,
            0x983e, 0x5152, 0xa831, 0xc66d,
            0xb003, 0x27c8, 0xbf59, 0x7fc7,
            0xc6e0, 0x0bf3, 0xd5a7, 0x9147,
            0x06ca, 0x6351, 0x1429, 0x2967,
            0x27b7, 0x0a85, 0x2e1b, 0x2138,
            0x4d2c, 0x6dfc, 0x5338, 0x0d13,
            0x650a, 0x7354, 0x766a, 0x0abb,
            0x81c2, 0xc92e, 0x9272, 0x2c85,
            0xa2bf, 0xe8a1, 0xa81a, 0x664b,
            0xc24b, 0x8b70, 0xc76c, 0x51a3,
            0xd192, 0xe819, 0xd699, 0x0624,
            0xf40e, 0x3585, 0x106a, 0xa070,
            0x19a4, 0xc116, 0x1e37, 0x6c08,
            0x2748, 0x774c, 0x34b0, 0xbcb5,
            0x391c, 0x0cb3, 0x4ed8, 0xaa4a,
            0x5b9c, 0xca4f, 0x682e, 0x6ff3,
            0x748f, 0x82ee, 0x78a5, 0x636f,
            0x84c8, 0x7814, 0x8cc7, 0x0208,
            0x90be, 0xfffa, 0xa450, 0x6ceb,
            0xbef9, 0xa3f7, 0xc671, 0x78f2]

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  let verticies = [1, 1, -1, 1, 1, -1, -1, -1]
  gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW)

  gl.vertexAttribPointer(posAtrLoc, 2, gl.FLOAT, false, 0, 0)

  dataLoc = gl.getUniformLocation(program, "data")
  hash1Loc = gl.getUniformLocation(program, "hash1")
  midstateLoc = gl.getUniformLocation(program, "midstate")
  targetLoc = gl.getUniformLocation(program, "target")
  nonceLoc = gl.getUniformLocation(program, "nonce_base")

  var hLoc = gl.getUniformLocation(program, "H")
  var kLoc = gl.getUniformLocation(program, "K")

  gl.uniform2fv(hLoc, h)
  gl.uniform2fv(kLoc, k)
}

function nonceToUint16Array(nonce) {
  let arr = new Uint16Array(2)
  arr[0] = (nonce >>> 16) & 0xFFFFFFFF
  arr[1] = nonce & 0xFFFFFFFF
  return arr
}

function isPixelWinner(buf, i, win) {
  pixel = 0
  pixel |= buf[i] << 24 & 0xFF000000
  pixel |= buf[i+1] << 16 & 0x00FF0000
  pixel |= buf[i+2] << 8 & 0x0000FF00
  pixel |= buf[i+3] & 0x000000FF
  if (debug) console.log('checking rgba:', pixel.toString(16))
  if (pixel === win) {
    return true
  } else {
    return false
  }
}

function glminer(work, callback) {
  let run = true

  const nextRun = function(work, callback) {
    let startTime = (new Date()).getTime()
    let nonce = work.nonceStart
    let threads = threads
    let curCnt = 0
    let x = 0
    let y = 0

    let submitWork = function(work, nonce) {
      callback(work, nonce)
    }

    while (run) {
      n = nonceToUint16Array(nonce)
      gl.uniform2fv(nonceLoc, n)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buf)

      for (let i = 0; i < buf.length; i += 4) {
        if (isPixelWinner(buf, i, 0)) {
          submitWork(work, nonce + i/4)
        }
      }

      nonce += threads
      totalHashes += threads

      reportProgress(work, nonce, totalHashes, (new Date()).getTime() - startTime)

      if (nonce > work.nonceEnd) {
        callback(null)
        break
      }

      if (useTimeout && ++curCnt > maxCnt) {
        curCnt = 0
        work.nonceStart = nonce
        var c = function() {
          nextRun(work, callback)
        }
        window.setTimeout(c, 1)
        return
      }
    }
  }

  const intMessage = function(e) {
    if (e.data.action === 'stop') {
      run = false
      console.log('forced to stop')
      return
    }
  }

  const mine = function(work, callback) {
    gl.uniform2fv(dataLoc, work.data)
    gl.uniform2fv(hash1Loc, work.hash1)
    gl.uniform2fv(midstateLoc, work.midstate)
    gl.uniform2fv(targetLoc, work.target)

    width = canvas.width
    height = canvas.height

    buf = new Uint8Array(width * height * 4)

    next_run(job, callback)
    return intMessage
  }

  return mine(work, callback)
}
