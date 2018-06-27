export default function() {
  let gl
  let webgl = {}
  let canvas

  try {
    canvas = document.createElement('canvas')
  } catch (err) {
    console.error(err)
    return {
      version: 'cpu',
    };
  }

  try {
    gl = canvas.getContext('webgl')
    webgl.version = 'webgl'
  } catch (err) {
    gl = null
  }

  if (gl === null) {
    try {
      gl = canvas.getContext('experimental-webgl')
      webgl.version = 'webgl'
    } catch (err) {
      gl = null
    }
  }

  if (!gl) {
    webgl.version = 'cpu'
    return webgl
  } else {
    let webgl2canvas = document.createElement('canvas')
    gl = webgl2canvas.getContext('webgl2')
    webgl.version = (typeof WebGL2RenderingContext !== 'undefined'
      && gl instanceof WebGL2RenderingContext) ? 'webgl2' : webgl.version
  }

  return webgl.version
}
