export const submitWork = function(work, nonce) {

}

export const getWork = function(callback) {
  var xhr = new XMLHttpRequest()
  xhr.open("GET", "/work", true)
  xhr.onreadystatechange = function() {
    let response = {
      error: true,
      message: 'Could not parse response.'
    }
    if (xhr.readyState === 4) {
      try {
        response = JSON.parse(xhr.responseText)
      } catch (err) {
        response.error = err
        response.response = xhr.responseText
      }
      if (typeof callback === 'function') callback(response);
    }
  }
  xhr.send()
}

// export const getWorkStub = function(callback) {
//   let work = {
//     id: '58af8d8c',
//     target: '00ffffffffffffffffffffffffff000000000000000000000000000000000000',
//     data: '0200000017975b97c18ed1f7e255adf297599b55330edab87803c81701000000000000008a97295a2747b4f1a0b3948df3990344c0e19fa6b2b92b3a19c8e6badc141787358b0553535f011948750833800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280',
//     midstate: 'dc6a3b8d0c69421acb1a5434e536f7d5c3c1b9e44cbb9b8f95f0172efc48d2df',
//     hash1: '00000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000100',
//     nonceStart: 0,
//     nonceEnd: 0xffffffff,
//     extranonce2: '00000000'
//   }
//   if (typeof callback === 'function') callback(work)
//   return work
// }

export const getWorkStub = function(callback) {
  let work = {
    id: '58af8d8c',
    target: '00000000ffff0000000000000000000000000000000000000000000000000000',
    data: '0200000017975b97c18ed1f7e255adf297599b55330edab87803c81701000000000000008a97295a2747b4f1a0b3948df3990344c0e19fa6b2b92b3a19c8e6badc141787358b0553535f011948750833800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280',
    midstate: 'dc6a3b8d0c69421acb1a5434e536f7d5c3c1b9e44cbb9b8f95f0172efc48d2df',
    hash1: '00000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000100',
    nonceStart: 0,
    nonceEnd: 0xffffffff,
    extranonce2: '00000000'
  }
  if (typeof callback === 'function') callback(work)
  return work
}
