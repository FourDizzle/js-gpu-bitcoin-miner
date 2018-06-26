export default function() {
  let gl
  let webgl = {}
  let canvas

  try {
    canvas = document.createElement('canvas')
  } catch (err) {
    console.error(err)
    return {
      available: false,
      version: false,
    };
  }

  try {
    gl = canvas.getContext('webgl')
    webgl.version = 1
    webgl.available = true
  } catch (err) {
    gl = null
  }

  if (gl === null) {
    try {
      gl = canvas.getContext('experimental-webgl')
      webgl.version = 1
      webgl.available = true
      webgl.experimental = true
    } catch (err) {
      gl = null
    }
  }

  if (!gl) {
    webgl.version = false
    webgl.available = false
    return webgl
  } else {
    let webgl2canvas = document.createElement('canvas')
    gl = webgl2canvas.getContext('webgl2')
    webgl.version = (typeof WebGL2RenderingContext !== 'undefined'
      && gl instanceof WebGL2RenderingContext) ? 2 : webgl.version
  }

  return webgl
}
