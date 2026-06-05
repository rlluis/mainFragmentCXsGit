# CKEditor 5 Editor Config Contributor Client Extension a button to share the article with social networks

This is a Liferay Client Extension built using JS mainly that adds a new button to the toolbar of CKEditor to call a specific agent created in AIHUB to generate summaries for the configured Social Networks (from a specific object holding each social network and additional instructions)

Important notes:

- To stablish the connection to AIHUB agent you need to subscribe to it. See in the code APIs such as: /o/ai-hub-cell/v1.0/authorization-tokens (retrieve needed tokens); /o/ai-hub/v1.0/agent-instances/subscribe (subscribe to a channel with the data from the previous call); Once the handshake is stablished you get a channel id that will be used, together with the authorization in POST to /o/ai-hub/v1.0/agent-instances; finally there's rendering the answer from the channel and disconnection (reader.cancel) to finish the interaction once AI returns an answer
-  The CX is calling an object to get the list of Social Networks to share to. The object is called "AI Hub Social Network" which has two main fields, name and instructions per social network. Example for Twiter --> Write a short, high-engagement hook using emojis, include a strong Call-to-Action to read the article, and use under 280 characters
- The CX is calling an agent with a specific ERC, "AIHUB-AGENT-SOCIALSYNDICATE" that you need to have in your AIHUB. This agent has just a node with a prompt similar to "You are a highly skilled Omnichannel Digital Marketer, B2B Copywriter, and Social Media Strategist. Your goal is to analyze the provided article content and generate highly engaging, tailored
promotional drafts for the selected social media platforms.". This agent is expecting "text" as the input variable and is outputing "generatedText" as the output variable.
- The majority of this code was generated with AI, yes, but always check documentation and LR's source code to better teach AI how to deal with all this. 
