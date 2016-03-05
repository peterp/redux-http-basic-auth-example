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
        isLoggingIn: true, // Show a loading indicator.
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
        isAuthenticated: true, // Hide the login view.
        hash: action.hash, // Used in subsequent API requests.
        user: action.user
      }
    default:
      return state
  }
}

export default user
