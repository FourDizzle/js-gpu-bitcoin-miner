export default function() {
  let gl
  let webgl = {}
  let canvas

  try {
    canvas = createElement('canvas')
  } catch (err) {
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
  } else {
    webgl.version = (typeof WebGL2RenderingContext !== 'undefined'
      && gl instanceof WebGL2RenderingContext) ? 2 : webgl.version
  }

  return webgl
}
