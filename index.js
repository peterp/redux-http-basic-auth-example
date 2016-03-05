import readlineSync from 'readline-sync'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

import { login } from './actions/user'
import { fetchFriends } from './actions/friends'

import userReducer from './reducers/user'
import friendsReducer from './reducers/friends'
const rootReducer = combineReducers({
  user: userReducer,
  friends: friendsReducer
})
const store = createStore(rootReducer, {}, applyMiddleware(thunk))



store.subscribe(() => {

  let state = store.getState()

  console.log('---------- STORE STATE ----------')
  console.log(JSON.stringify(state, null, 4))
  console.log('---------------------------------')

  readlineSync.keyInPause()
})

console.log('~~~ Step 1: The user enters a username and password, and taps login.')
store.dispatch(login('admin', 'secret'))
