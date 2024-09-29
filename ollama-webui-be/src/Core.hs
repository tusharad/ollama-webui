{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}
module Core (startApp) where

import Web.Scotty
import Data.Aeson hiding (json)
import GHC.Generics
import Control.Monad.IO.Class
import Network.Wai.Middleware.Cors
import Network.Wai (Middleware)
import Ollama
import Data.Text (Text)
import Database.SQLite.Simple
import qualified Data.Text as T

data Conversation = Conversation { convo_id :: Int, convo_title :: Text } deriving (Show, Generic)
instance ToJSON Conversation
data Chat = Chat { role :: Text, message :: Text } deriving (Show, Generic)
instance ToJSON Chat
instance FromJSON Chat
data PromptInput = PromptInput { prompt :: Text, conversation_id :: Int } deriving (Show, Generic)
instance FromJSON PromptInput

-- FROM ROW instances
instance FromRow Conversation where
  fromRow = Conversation <$> field <*> field

instance FromRow Chat where
  fromRow = Chat <$> field <*> field

customCors :: Middleware
customCors = cors (const $ Just policy)
  where
    policy = CorsResourcePolicy
      { corsOrigins = Nothing  -- Nothing means allow all origins
      , corsMethods = ["GET", "POST", "OPTIONS"]  -- Allowed methods
      , corsRequestHeaders = ["Authorization", "Content-Type"] -- Allowed headers
      , corsExposedHeaders = Just ["Authorization"]
      , corsMaxAge = Just 3600
      , corsVaryOrigin = False
      , corsRequireOrigin = False
      , corsIgnoreFailures = False
      }

startApp :: IO ()
startApp = do
  conn <- open "chatgpt.db"
  initializeDatabase conn
  scotty 5000 $ do
    middleware customCors
    get "/get_conversations" $ do
      conversations <- liftIO $ query_ conn "SELECT convo_id, convo_title FROM conversation ORDER BY created_at DESC"
      json (conversations :: [Conversation])

    get "/get_conversation/:id" $ do
      convoId <- captureParam "id" :: ActionM Int
      chats <- liftIO $ query conn "SELECT role, message FROM chats WHERE convo_id = ?" (Only convoId)
      json (chats :: [Chat])

    post "/chat" $ do
      p <- jsonData :: ActionM PromptInput
      let cId = conversation_id p
      let trimmedP = T.dropEnd 3 $ T.drop 3 $ prompt p
      newConvoId <- case cId of
        -1 -> do
          liftIO $ execute conn "INSERT INTO conversation (convo_title) VALUES (?)" (Only ("latest title" :: String))
          [Only convoId] <- liftIO $ query_ conn "SELECT last_insert_rowid()" :: ActionM [Only Int]
          pure convoId
        _ -> pure cId

      liftIO $ execute conn "INSERT INTO chats (convo_id, role, message) VALUES (?, 'user', ?)" (newConvoId, trimmedP)
      stream $ \sendChunk flush -> do
          res <- liftIO $ generateReturningResponse "llama3.2" (prompt p) sendChunk flush
          liftIO $ execute conn "INSERT INTO chats (convo_id, role, message) VALUES (?, 'ai', ?)" (newConvoId, res)
      titleForConversation <- liftIO $ generateReturningResponse' "llama3.2" ("Give me 4-5 word title for this conversation question starter: " <> prompt p)
      liftIO $ execute conn "Update conversation set convo_title = ? where convo_id = ?" (titleForConversation, newConvoId)

initializeDatabase :: Connection -> IO ()
initializeDatabase conn = do
  execute_ conn $
    "CREATE TABLE IF NOT EXISTS conversation (\
    \ convo_id INTEGER PRIMARY KEY, \
    \ convo_title TEXT NOT NULL, \
    \ created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    \ updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
  execute_ conn $
    "CREATE TABLE IF NOT EXISTS chats (\
    \ chat_id INTEGER PRIMARY KEY, \
    \ convo_id INTEGER, \
    \ role TEXT CHECK (role IN ('user', 'ai')), \
    \ message BLOB NOT NULL, \
    \ created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    \ updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
    \ FOREIGN KEY (convo_id) REFERENCES conversation(convo_id))"