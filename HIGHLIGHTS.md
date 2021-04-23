# Highlights  

This is a document highlighting some of the sections of the project.

## Threading

Twitter threads are created when a tweet is posted in response to another tweet. My implementation was modeled after Doubly Linked Lists and treating each tweet as a node. 

<br />

The idea is that each tweet may contain a 'pointer' to another tweet. This pointer is named 'reply_to' in the tweet schema. Each tweet also contains property 'thread' which is an array which possibly contains tweets replying to it. These optional pointers give us flexibility by allowing a tweet to be a standalone tweet, a reply, or a thread starter and a reply.

<br />

To explain the logic I will use an example scenario. Lets name one tweet 'Starter' and another tweet 'Response'. When the tweet Starter is created, it will not have the property 'reply_to'. When Response is created, it's 'reply_to' property will be the id of Starter. What will also happen is Response's id will be pushed as a subdocument into an array named 'thread' of Starter's document. The thread array allows us to see all the tweets that replied to our tweet Starter. But what happens if we have a tweet named ResponseToResponse is created as a reply to Response? Remember that each tweet also contains a 'thread' property as well as a 'reply_to' property which allows a tweet to be a reply as well as a thread starter. This allows for multiple layers of threads in our API.

## User Authentication

Our user authentication only allows usernames that do not contain profanity, are under 50 characters, and have to be unique. It also only allows passwords that contain at least 8 characters which have at least one lowercase letter, one uppercase letter, one number, and one special character. In addition, password validation also only allows passwords that haven't been found in a database breach. It does this by using the [haveibeenpwned](https://haveibeenpwned.com/) API. Our password validation checks that API without ever sending the full password using the "k-anonymity" model. This strategy was provided by [jamiebuilds/havetheybeenpwned](https://github.com/jamiebuilds/havetheybeenpwned). Having this extra step strengthens users accounts by not allowing reused passwords that have been comprimised.

## Past projects that provided inspiration

  * [Discord-clone-api](https://github.com/khoaHyh/discord-clone-api)
  * [Smart-brain-api](https://github.com/khoaHyh/smart-brain-api)
