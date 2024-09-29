// src/components/Sidebar.js
import React from 'react';

const Sidebar = ({ conversations, onSelectConversation }) => (
    <div id="sidebar" className="w-64 sidebar-gradient text-white flex-none p-4 hidden sm:block">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <ul>
            {conversations.map((conversation) => (
                <li
                    key={conversation.id}
                    className="mb-2 p-2 transition-colors duration-200 hover:bg-yellow-500 cursor-pointer rounded-lg"
                    onClick={() => onSelectConversation(conversation.convo_id)}
                >
                    {conversation.convo_title}
                </li>
            ))}
        </ul>
    </div>
);

export default Sidebar;