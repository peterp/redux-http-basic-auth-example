# Redux HTTP Basic Authentication

When an app communicates with a HTTP API, which enforces some form of authentication, the app typically follows these steps:

  1. The app is not authenticated, so we prompt the user to log in.
  2. The user enters their credentials (username and password), and taps submit.
  3. We send these credentials to the API, and inspect the response:
      4. On success (200 - OK): We cache the authentication token/ hash, because we're going to use this token/ hash _in every subsequent_ request.
        5. If the token/ hash does not work during any of the subsequent API requests (401 - Unauthorized), we'll need to invalidate the hash/ token and prompt the user to log in again.
      6. Or, on failure (401 - Unauthorized): We display an error message to the user, prompting them re-enter their credentials.

# Logging In #

Based on the work flow defined above we start our app by displaying a login form, _step 2_ kicks in when the user taps the login button... Dispatching the `login` action creator, let's jump into some code...

```
/// actions/user.js

export function login(username, password) {
  return (dispatch) => {

    // We use this to update the state of `isLoggingIn` to `true` in our
    // store, which can be used to display an activity indicator on the login
    // view.
    dispatch(loginRequest())

    // Note: This base64 encode method only works in NodeJS, so use an
    // implementation that works for your platform:
    // `base64-js` for React Native,
    // `btoa()` for browsers,
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
        // We pass the `authentication hash` down to the reducer so that it
        // can be used in subsequent API requests.

        dispatch(loginSuccess(hash, data.user))
      },
      (response, data) => dispatch(loginFailure(data.error || 'Log in failed'))
    )
  }
}
```

There's a lot of code in the function above, but take comfort in the fact that
the majority of the code is sanitizing the request and can be abstracted away.

The first thing we do is dispatch an action creator:
```
dispatch(loginRequest())
```
Which results in our store letting us know that the user `isLoggingIn`. We use this to display an activity indicator (_spinning wheel, "Loading...", etc._), and to disable the log in button in our log in view.

Next we base64 encode our credentials, and setup a fetch request.
```
const hash = new Buffer(`${username}:${password}`).toString('base64')
return fetch('https://httpbin.org/basic-auth/admin/secret', {
  headers: {
    'Authorization': `Basic ${hash}`
  }
/* ... */
```

Everything went well, so we...
```
dispatch(loginSuccess(hash, data.user))
```
Our `LOGIN_SUCCESS` action results in us having an authentication `hash` in our store, which we'll use in subsequent requests.

If something went wrong then we want to let the user know...
```
dispatch(loginFailure(data.error || 'Log in failed')
```

_The `loginSuccess`, `loginFailure`, and `loginRequest` action creators are fairly generic and don't really warrant code samples. (See `[actions/user.js](https://github.com/peterp/redux-http-basic-auth-example/blob/master/actions/user.js)`)_

### Reducer ###

Our reducer is also typical:

```
/// reducers/user.js

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
        isAuthenticated: true, // Dismiss the login view.
        hash: action.hash, // Used in subsequent API requests.
        user: action.user
      }
    default:
      return state
  }
}
```

# Subsequent API requests #

Now that we have an authentication hash in our store we can use it in subsequent action creators, passing it in to requests.

In our example below we're fetching a list of friends for our authenticated user:
```
/// actions/friends.js
export function fetchFriends() {
  return (dispatch, getState) => {

    dispatch(friendsRequest())

    // Notice how we grab the
    const hash = getState().user.hash
    return fetch(`https://httpbin.org/get/friends/`, {
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
```

You'll find that most API requests typically dispatches the same 3 actions as above: `API_REQUEST`, `API_SUCCESS`, and `API_FAILURE`, and as such the majority of the request/ response code can be pushed into [middleware](https://github.com/reactjs/redux/issues/99#issuecomment-112198579).

We fetch the hash authentication token from the store and setup the request.
```
const hash = getState().user.hash
return fetch(`https://httpbin.org/get/friends/`, {
  headers: {
    'Authorization': `Basic ${hash}`
  }
})
```

If the API response with a 401 unauthorized status code then we've got to remove our hash from the store, and present the user with a log in view again.
```
// did our request fail because our auth credentials aren't working?
if (response.status == 401) {
  dispatch(loginFailure(data.error))
}
```
