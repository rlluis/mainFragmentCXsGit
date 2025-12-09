# ChatBoot

This fragment is a chatbot floating icon that will be situated on the bottom right corner. Once you expand it, a Chat will start. This is a simulated chat against an Object which means that you can create a Liferay Object, store there 1-2-3-4-etc possible answers and then simulate a full conversation while demoing. 

It is fully configurable so you can set the name of the Object, the name of the field with the messages, name of the field with the ID (For the order) and the correlationID (message 1, message 2, etc.). The object can be scoped to Instance or to Site and the messages can also be translated (the value will always be recovered using the user's language or default if it is not translated). One example of an object could be:

Object: chatMessages
Fields: chatMessageID, chatMessageText (Translatable)
Scope: Instance

1 How can I help you? EN-US 
1 Hola, como puedo ayudarte ES-ES
2 Can you please tell me more about it? EN-US
2 Puedes por favor darme más información? ES-ES
Etc.

Apart from the Object itself, the appearance of the chatbot is also configurable where you can set colors of the different aspects and also the Clay icon inside the circle that is floating to start the chatbot.