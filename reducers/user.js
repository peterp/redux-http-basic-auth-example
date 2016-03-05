
// The request, failure, success pattern is very typical when performing
// HTTP requests. The amount of boilerplate can be reduced using Redux
// middleware, _or so I've read._

import {
  LOGIN_REQUEST,
  LOGIN_FAILURE,
  LOGIN_SUCCESS
} from '../actions/user'

function user(state = {
  isLoggingIn: false,
  isAuthenticated: false
}, action) {
  switch(action.type) {
    case LOGIN_REQUEST:
      return {
        isLoggingIn: true,
        isAuthenticated: false
      }
    case LOGIN_FAILURE:
      return {
        isLoggingIn: false,
        isAuthenticated: false,
        error: action.error
      }
    case LOGIN_SUCCESS:
      return {
        isLoggingIn: false,
        isAuthenticated: true,
        hash: action.hash,
        user: action.user
      }
    default:
      return state
  }
}

export default user
