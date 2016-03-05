import fetch from 'isomorphic-fetch'

export const LOGIN_REQUEST = 'login.request'
export const LOGIN_SUCCESS = 'login.success'
export const LOGIN_FAILURE = 'login.failure'

export function loginSuccess(hash, user) {
  return {
    type: LOGIN_SUCCESS,
    hash,
    user
  }
}
function loginRequest() {
   return {
      type: LOGIN_REQUEST
   }
}
export function loginFailure(error) {
  return {
    type: LOGIN_FAILURE,
    error
  }
}

export function login(username, password) {
  return (dispatch) => {

    dispatch(loginRequest())

    // Note: This only works in node.js, use an implementation that works
    // for the platform you're using, e.g.: base64-js for React Native, or
    // btoa() for browsers.
    const hash = new Buffer(`${username}:${password}`).toString('base64')
    return fetch('https://httpbin.org/basic-auth/admin/secret', {
      headers: {
        'Authorization': `Basic ${hash}`
      }
    })
    .then(response => response.json().then(json => ({ json, response })))
    .then(({json, response}) => {
      if (response.ok === false) {
        return Promise.reject(response, json)
      }
      return json
    })
    .then(
      data => {
        // data = { authenticated: true, user: 'admin' }
        dispatch(loginSuccess(hash, data.user))
      },
      (response, data) => dispatch(loginFailure(data.error || 'Log in failed'))
    )
  }
}
