# Twitter-clone-api                                                                         
A backend exposing an API that is similar to Twitter.

## Known issues

  * Unit/Integration tests may hang or not run at all due to async/await calls.
      * A current fix is adding `--timeout 10000` to our test script to lengthen timeout
      * It's possible that the connection to our MongoDB database is the problem.
      * It's also possible that async/await syntax has something to do with this.
#### `Possible solution to this:`
```javascript
describe("Some route", function () {
    it("should return 200", function(done) {
        asyncMethod()
            .then(() => {
                done();
            });
    });
});
```

## Local developement   

#### `Setup`
```shell
$ git clone https://github.com/khoaHyh/twitter-clone-api.git

$ cd twitter-clone-api

$ npm i
```

#### `.env file`
> You method you use to come up with the session secret is up to your preference. You can set up your own MongoDB cluster using MongoAtlas for free.
```shell
SESSION_SECRET=createYourOwnSessionSecret
MONGO_URI=mongodb+srv://<username>:<password>@clusterName.somethingElseHere.mongodb.net/databaseNameHere?retryWrites=true&w=majority

```
#### `Run server`
```shell
$ npm run dev
```
#### `Test`
```shell
$ npm test
```

## Features
  * User registration using unique username  and password
  * User login (including session maintenance)
  * Chat with other users (direct messages)
  * Create, read, update, and delete tweet
  * Unit/Integration tests for all endpoints above
  * Like/unlike a tweet

## Tech/framework used
#### Built with:                                                                 
  * MongoDB
  * Express
  * Node.js
  * Mocha
  * Chai
  * Passport.js

## Postman/Insomnia usage examples
> ObjectId: 607cb8351198bea212fb is used only as an example and may or may not exist in the database.
#### Getting all tweets
#### `GET` `http://localhost:8080/home/tweets/lookup`
#### Showing a single tweet
#### `GET` `http://localhost:8080/home/tweets/show/607cb8351198bea212fb`
#### Creating a tweet
#### `POST` `http://localhost:8080/home/tweets/create`
```
## Request body in JSON format
{ "text": "Hello twitter clone!" }
```
#### Updating/Editing a tweet
#### `PUT` `http://localhost:8080/home/tweets/update`
```
{ "id": "607cb8351198bea212fb", "text": "Update this tweet." }
```
#### Deleting a tweet
#### `DELETE` `http://localhost:8080/home/tweets/delete?tweetId=607cb8351198bea212fb`
