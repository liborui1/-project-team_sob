# Video Link:

https://www.youtube.com/watch?v=-9HKllvfvMI&feature=youtu.be

# Drawshare REST API Documentation

### Create
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
- response: 409
    - body: user :username already exists

``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signup/
```
### Non CRUD operations

- description: sign in to the application
- request: `POST /signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) the user's username
      - password: (string) the user's password
- response: 200
    - content-type: `application/json`
    - body: user :username signed in
- response: 500
      - body: error while signing in
- response: 401
    - body: access denied

``` 
$ curl -H "Content-Type: application/json" 
       -X POST 
       -d '{"username":"alice","password":"alice"}' -c cookie.txt localhost:3000/signin/
```

- description: sign out of the application 
- request: `GET /signout/`   
- response: 200

``` 
$ curl -b cookie.txt -c cookie.txt localhost:3000/signout/
```
