# CKEditor 5 Editor Config Contributor Client Extension 

This is a Liferay Client Extension built using JS mainly that adds a new button to the toolbar of CKEditor to call a specific agent created in AIHUB to generate articles. This will be OOTB in LR very soon, but meanwhile this serves as an example to learn how to call a specific AI Agent from a LR's UI, in this case created with a Client Extension

Important notes:

- PENDING to test it under AIHUB provided by LR in SaaS
- To stablish the connection to AIHUB agent you need to subscribe to it. See in the code APIs such as: /o/ai-hub-cell/v1.0/authorization-tokens (retrieve needed tokens); /o/ai-hub/v1.0/agent-instances/subscribe (subscribe to a channel with the data from the previous call); Once the handshake is stablished you get a channel id that will be used, together with the authorization in POST to /o/ai-hub/v1.0/agent-instances; finally there's rendering the answer from the channel and disconnection (reader.cancel) to finish the interaction once AI returns an answer
- The CX is calling an agent with a specific ERC, "AIHUB-AGENT-CREATETEXT" that you need to have in your AIHUB. This agent has just a node with a prompt similar to "You are an expert content generator. Create a 200-300 words article using the provided text as your main topic, adding relevant and natural details that clarify or enrich its meaning. Keep the original tone and intent. Output only the created text.". This agent is expecting "text" as the input variable and is outputing "generatedText" as the output variable.
- The majority of this code was generated with AI, yes, but always check documentation and LR's source code to better teach AI how to deal with all this. IF not you won't suceed, specifically with new products, with less documentation so far (coming!). CKEditor CX, https://learn.liferay.com/w/dxp/development/customizing-liferays-look-and-feel/using-an-editor-config-contributor-client-extension
