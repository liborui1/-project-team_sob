# Video Link:

https://www.youtube.com/watch?v=-9HKllvfvMI&feature=youtu.be

# Drawshare REST API Documentation

#### Create User
- description: sign up to the application
- request: `POST /signup/`
    - content-type: `application/json`
    - body: object
      - username: (string) the user's username
      - password: (string) the user's password
- response: 200
    - content-type: `application/json`
    - body: user :username signed up
- response: 500
      - body: error while signing up
- response: 422
    - body: input validation error
- response: 409
    - body: user :username already exists

``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
```
#### Create Lobby
- description: An authenticated user can create a lobby
- request: `POST /createLobby/`
    - content-type: `application/json`
    - body: object
      - name: (string) the lobby name 
      - password: (string) the lobby password
      - peerId: (string) the peerId other users need to connect to
- response: 200
    - content-type: `application/json`
    - body: Lobby <name> Created
- response: 500
      - body: Server side error while creating lobby
 - response: 422
    - body: input validation error     
- response: 409
    - body:  Access Denied
- response: 401
    - body: Lobby already <name> Exists
 
``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{"name":"alicesLobby","password":"alice123", "peerId":"1234"}' -c cookie.txt localhost:3000/createLobby/
```
### Create Save
- description: An authenticated user can create a board save 
- request: `POST /api/saveboard/`
    - content-type: `application/json`
    - body: object
      - name: (string) the board name 
      - boardData : (obj) All the points on the board
- response: 200
    - content-type: `application/json`
    - body: Board <name> Saved
- response: 500
      - body: Server side error while creating a save
 - response: 422
    - body: input validation error     
- response: 409
    - body:  Access Denied
 
``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{ "name": "save1", "boardData": "[[{"x":459,"y":218,"panX":0,"panY":0,"scaleFactor":1,"color":"#000000","font":5,"isDragging":false}]]"}' -c cookie.txt localhost:3000/saveBoard/
```

### Join Lobby
- description: Any user/non-user can join into lobbies
- request: `POST /joinLobby/`
    - content-type: `application/json`
    - body: object
      - name: (string) the lobby name 
      - password: (string) the lobby password
      - peerId: (string) the peerId other users need to connect to
- response: 200
    - content-type: `application/json`
    - body: {connectedPeers: ["person1", "person2"], owner: "person1"}
- response: 500
      - body: Server side error while creating a save
 - response: 422
    - body: input validation error  
- response: 404
    - body:  Lobby not found
- response: 401
    - body:  Incorrect Password
 
``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{"name":"alicesLobby","password":"alice123", "peerId":"1234"}' -c cookie.txt localhost:3000/joinLobby/
```
### Get PeerToUser
- description: Query for getting the user with the associated peerid
- request: `GET /peerToUser/:peerId`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
    - body: "userone"
- response: 500
      - body: Server side error while getting username
 - response: 422
    - body: input validation error  
``` 
$ curl -H "Content-Type: application/json" 
       -X GET 
        -c cookie.txt localhost:3000/peerToUser/1234
```

### Get SavedBoard
- description: Query for getting the boardData with the associated index of the logged in user
- request: `GET /api/saveboard/:boardIndex'`
    - content-type: `application/json`
    - body: object
    - boardData:  `[boardData]`
- response: 200
    - content-type: `application/json`
    - body: "Board saved"
- response: 500
      - body: Server side error while getting savedData
 - response: 401
    - body: Access Denied
``` 
$ curl -H "Content-Type: application/json" 
       -X GET 
        -c cookie.txt localhost:3000/api/saveboard/2
```

### Get NameofSavedBoards

- description: Returns all the names of the boards of the logged in user
- request: `GET /api/boadnames/`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
    - body:  `["board1","board2"] `
- response: 500
      - body: Server side error while getting name of boards
 - response: 401
    - body: Access Denied
``` 
$ curl -H "Content-Type: application/json" 
       -X GET
        -c cookie.txt localhost:3000/api/boadnames/
```
### Patch LobbyUsers

- description: Kicks id from the lobby, only lobby owner can kick users
- request: `PATCH /lobby/kick/:id`
    - content-type: `application/json`
    - body: object
        - name: (string) lobby Name
- response: 200
    - content-type: `application/json`
    - body:  `Kicked user1`
- response: 500
      - body: Server side error while kicking user
 - response: 422
    - body: input validation error  
 - response: 401
    - body: Access Denied
``` 
$ curl -H "Content-Type: application/json" 
       -X PATCH
       -d '{"name":"alice"}'
        -c cookie.txt localhost:3000/lobby/kick/123
```


### Get LobbyUsers

- description: Gets list of users in the lobby
- request: `GET /lobby/list/:lobbyname`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
    - body:  `["peer1", "peer2"]`
- response: 500
      - body: Server side error 
 - response: 404
    - body: Lobby not found
 - response: 401
    - body: Access Denied
``` 
$ curl -H "Content-Type: application/json" 
       -X GET
        -c cookie.txt localhost:3000/lobby/list/lobby1
```


### Patch LobbyPassword

- description: Updates password
- request: `PATCH /lobby/password/:LobbyName`
    - content-type: `application/json`
    - body: object
      - password: (string) the user's password

- response: 200
    - content-type: `application/json`
    - body:  `Password Updated`
- response: 500
      - body: Server side error
 - response: 404
    - body: Lobby not found
 - response: 401
    - body: Access Denied
``` 
$ curl -H "Content-Type: application/json" 
       -X PATCH
       -d '{"password":"alice"}'
        -c cookie.txt localhost:3000/lobby/password/lobby1
```

### Get PasswordProtected

- description: returns if a lobby is password protected
- request: `GET /lobby/passwordprotected/:lobbyName`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
    - body:  `Boolean`
- response: 500
      - body: Server side error 
 - response: 404
    - body: Lobby not found
``` 
$ curl -H "Content-Type: application/json" 
       -X GET
        -c cookie.txt localhost:3000/lobby/passwordprotected/lobby1
```


### Get ReadOnlyList

- description: returns the lsit of users who can only view the board
- request: `GET /lobby/readOnly/:lobbyName`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
    - body:  `["user1", "user2"]`
- response: 500
      - body: Server side error 
 - response: 404
    - body: Lobby not found
  - response: 401
    - body: Access Denied   
``` 
$ curl -H "Content-Type: application/json" 
       -X GET
        -c cookie.txt localhost:3000/lobby/readOnly/lobby1
```
### Patch ReadOnlyList

- description: adds/removes users to the read only list and returns the updated list
- request: `PATCH /lobby/readOnly/:peerId`
    - content-type: `application/json`
    - body: object
      - lobby: (string) the lobbys name
      - action: (string) add/remove

- response: 200
    - content-type: `application/json`
    - body:  `["user1", "user2"]`
- response: 500
      - body: Server side error 
- response: 422
    - body: input validation error  
 - response: 404
    - body: Lobby not found
  - response: 401
    - body: Access Denied   
``` 
$ curl -H "Content-Type: application/json" 
       -X PATCH
        -c cookie.txt localhost:3000/lobby/readOnly/lobby1
```


### Non CRUD operations
#### Signin
- description: sign in to the application
- request: `POST /signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) the user's username
      - password: (string) the user's password
- response: 200
    - content-type: `application/json`
    - body: user : username signed in
- response: 500
      - body: error while signing in
- response: 401
    - body: access denied

``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
```
#### Signout
- description: sign out of the application 
- request: `GET /signout/`   
- response: 200

``` 
$ curl -X GET -b cookie.txt -c cookie.txt localhost:3000/signout/
```
#### Join Lobby

- description: redirects user to associated lobbyid, used for quick links
- request: `GET /joinBoard/:id`   
- response: 200

``` 
$ curl -b cookie.txt -c cookie.txt localhost:3000/joinBoard/lobby1
```
###  PeerServer 

#### onDisconnect
- description: when user disconnects from the peerserver, the lobbies are updated to remove that user from all lobbies
 
``` 

```