# Highlights  

This is a document highlighting some of the sections of the project.

## Threading

Twitter threads are created when a tweet are posted in response to another tweet. My implementation was modeled after Linked Lists and treating each tweet as a node. 

<br />

The idea is that each tweet may contain a 'pointer' to another tweet. This pointer is named 'reply_to' in the tweet schema. This pointer is not required in the schema which allows the model to be flexible by allowing a tweet to be a standalone tweet or a reply. 

<br />

To explain the logic I will use an example scenario. Lets name one tweet 'Starter' and another tweet 'Response'. When the tweet Starter is created, it will not have the property 'reply_to'. When Response is created, it's 'reply_to' property will be the id of Starter. What will also happen is Response's id will be pushed as a subdocument into an array named 'thread' of Starter's document. The thread array allows us to see all the tweets that replied to our tweet Starter. But what happens if we have a tweet named ResponseToResponse is created as a reply to Response? Each tweet also contains a 'thread' property as well as 'reply_to' which allows a tweet to be a reply as well as a thread starter. This allows for multiple layers of threads in our API.

## Past projects that inspired this one

  * [Discord-clone-api](https://github.com/khoaHyh/discord-clone-api)
  * [Smart-brain-api](https://github.com/khoaHyh/smart-brain-api)
