import fetch from 'isomorphic-fetch'

import { loginFailure } from './user'

export const FRIENDS_REQUEST = 'friends.request'
export const FRIENDS_SUCCESS = 'friends.success'
export const FRIENDS_FAILURE = 'friends.failure'

export function friendsSuccess(friends) {
  return {
    type: FRIENDS_SUCCESS,
    friends
  }
}
function friendsRequest() {
   return {
      type: FRIENDS_REQUEST
   }
}
function friendsFailure(error) {
  return {
    type: FRIENDS_FAILURE,
    error
  }
}

// Note: This is the same endpoint that we're using for authentication in user.js,
// but pretend that its returning a list of friends.
export function fetchFriends(endpoint = 'basic-auth/admin/secret') {
  return (dispatch, getState) => {

    dispatch(friendsRequest())

    const hash = getState().user.hash
    return fetch(`https://httpbin.org/${endpoint}`, {
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
        // data = { friends: [ {}, {}, ... ] }
        dispatch(friendsSuccess(data.friends))
      },
      (response, data) => {
        dispatch(friendsFailure(data.error))

        // did our request fail because our auth credentials aren't working?
        if (response.status == 401) {
          dispatch(loginFailure(data.error))
        }
      }
    )
  }
}
