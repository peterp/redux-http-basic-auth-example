# redux-http-basic-auth-example

When a client, web or app, communicates with an HTTP API which enforces some form of authentication, the client typically follows this pattern:

  1. The app is not authenticated, the user is presented a log in screen.
  2. The user enters their username and password, and taps submit.
  3. The credentials are sent to the API and the app inspects the response:
    3.1. On success (200 - OK): The authentication token or hash is cached, and the app uses this token in every subsequent request. If at any stage, during an API request, the hash or token doesn't work (401 - Unauthorized) the user needs to be prompted to re-enter their credentials.
    3.2. On failure (401 - Unauthorized): The client displays an error message to the user, prompting them re-enter their credentials.
