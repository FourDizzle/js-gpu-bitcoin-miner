const BASE_URL = 'http://localhost:5000'

const DEFAULT_CALLBACK = (data) => console.log(data)

export const submitWork = function(work, nonce, callback) {
  // minername = 'FourDizzle.worker1'
  // body = {
  //   minername,
  //   work,
  //   nonce,
  // }
  // options = {
  //   headers: {
  //     'content-type': 'application/json; charset=UTF-8',
  //   },
  //   method: 'POST',
  //   body: body,
  // }
  //
  // if (typeof callback !== 'function') callback = DEFAULT_CALLBACK
  //
  // fetch(BASE_URL + '/submit', options)
  //   .then(res => res.json())
  //   .then((data) => {
  //     console.log('data', data)
  //   })
}

export const getWork = function(callback) {
  fetch(BASE_URL + '/work')
    .then(res => res.json())
    .then(data => {
      if (typeof callback === 'function') callback(data.result)
      return data
    })
}

export const reportProgress = function(progress, callback) {

}

export const onUpdateJob = function(callback) {

}

export const onRequestProgress = function(callback) {

}
