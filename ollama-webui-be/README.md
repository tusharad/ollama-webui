# ollama-webui-be

Write a haskell scotty application with sqlite-simple for following:

Sqlite database schema

conversation {
    convo_id integer primary key,
    convo_title text not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
};

chats {
    chat_id integer primary key,
    convo_id integer fKey conversation,
    role text not null, -- can be either user or ai, add a check here or something
    message blob not null,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp
}

APIs:

GET "/get_conversations" should return json structure containing list of convo_id and convo_title in the desc order of timestamp.

GET "/get_conversation/<id>" should return the list of chats associated with convo_id.

POST "/chat" will take prompt jsonbody and add it in the chats table, first will add a new entry in the conversation table with convo_title as "latest title" and use the convo_id to insert the data in chats. and will return the stream response like this:

```
post "/chat" $ do
    p <- jsonData :: ActionM PromptInput
    stream $ \sendChunk flush -> do
        liftIO $ generateReturningResponse
            "llama3.2"               -- Replace with actual model name
            (prompt p)                  -- Replace with actual prompt
            sendChunk                 -- Function to send each chunk to the client
            flush                     -- Function to flush the stream
```

After streaming the response the response_content should get added in the chat table with role as user