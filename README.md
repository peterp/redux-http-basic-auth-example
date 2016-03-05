# redux-http-basic-auth-example


When an app communicates with a HTTP API, which enforces some form of authentication, the app typically follows these steps:

  1. The app is not authenticated, so the user is prompted to log in.
  2. The user enters their username and password, and taps submit.
  3. The credentials are sent to the API, and the app inspects the response:
      4. On success (200 - OK): The authentication token or hash is cached, the app uses this token in every subsequent request.
        5. If at any stage, during an API request, the hash or token doesn't work anymore (401 - Unauthorized), then the user is prompted to re-enter their credentials.
      6. On failure (401 - Unauthorized): The client displays an error message to the user, prompting them re-enter their credentials.

With the work flow defined above we'll start with the Reflux _action creators_ and _reducers_.


In _step 2_ the user taps the submit button, which dispatches the `login(username, password)` function.

```
/// actions/user.js

export function login(username, password) {
  return (dispatch) => {

    /* We use this to update the state of `isLoggingIn` to `true` in our store, which can be used to display an activity indicator on the login view. */
    dispatch(loginRequest())

    /* This only works in Node, use an implementation that work for the platform you're using, e.g.: `base64-js` for React Native, or `btoa()`` for browsers. */
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
```
