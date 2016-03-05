
import {
  FRIENDS_REQUEST,
  FRIENDS_FAILURE,
  FRIENDS_SUCCESS
} from '../actions/friends'

function user(state = {
  isLoading: false,
  friends: []
}, action) {
  switch(action.type) {
    case FRIENDS_REQUEST:
      return {
        isLoading: true,
        friends: []
      }
    case FRIENDS_FAILURE:
      return {
        isLoading: false,
        error: action.error
      }
    case FRIENDS_SUCCESS:
      return {
        isLoading: false,
        friends: action.friends
      }
    default:
      return state
  }
}

export default user
