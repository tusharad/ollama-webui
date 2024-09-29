// src/App.js
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';

const App = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('http://localhost:5000/get_conversations');
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
          if (data.length > 0) {
            console.log("setting current chat id as ", data[0].convo_id)
            setCurrentChatId(data[0].convo_id); // Load the latest conversation initially
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  const handleSelectConversation = (chatId) => {
    setCurrentChatId(chatId);
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
      />
      <Chat chatId={currentChatId} />
    </div>
  );
};

export default App;