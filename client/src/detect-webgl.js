export default function() {
  let gl = null
  let webgl = {}
  let names = ['webgl2', 'webgl']
  let canvas

  try {
    canvas = document.createElement('canvas')
  } catch (err) {
    console.error(err)
    return 'cpu';
  }

  for (let i = 0; i < names.length; i++) {
    try {
      gl = canvas.getContext(names[i])
      if (gl) {
        return names[i];
      }
    } catch (err) {
      console.error(err)
      return 'cpu';
    }
  }
}
