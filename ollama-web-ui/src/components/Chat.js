import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import TextareaAutosize from 'react-textarea-autosize';

const Chat = ({ chatId }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [convoId, setConvoId] = useState(chatId);

    useEffect(() => {
        setConvoId(chatId);
    }, [chatId]);

    useEffect(() => {
        const fetchConversation = async () => {
            if (convoId === -1) return; // Skip if it's a new tab

            setLoading(true);
            try {
                const response = await fetch(`http://localhost:5000/get_conversation/${convoId}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data || []);
                }
            } catch (error) {
                console.error('Error fetching conversation:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversation();
    }, [convoId]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        const prompt = `"""${input.trim()}"""`;
        const newMessage = { role: 'user', message: input };
        setMessages([...messages, newMessage, { role: 'ai', message: 'Loading...' }]);
        setInput('');

        console.log("Sending message with convoId:", convoId);

        let cId = -1
        if (convoId !== null) {
            cId = convoId
        }

        try {
            const response = await fetch('http://localhost:5000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt, conversation_id: cId
                }) // Ensure JSON key matches server's expectation
            });

            if (response.ok) {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let chatbotResponse = '';

                while (!done) {
                    const { value, done: readDone } = await reader.read();
                    done = readDone;
                    chatbotResponse += decoder.decode(value, { stream: !done });
                    setMessages((prevMessages) =>
                        prevMessages.map((msg, idx) =>
                            idx === prevMessages.length - 1
                                ? { ...msg, message: chatbotResponse }
                                : msg
                        )
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching response:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };

    const openNewTab = () => {
        setMessages([]);
        setConvoId(-1);
    };

    return (
        <div className="flex-1 flex flex-col sidebar-gradient">
            <header className="sidebar-gradient text-white py-4 px-6 shadow-md flex justify-between items-center">
                <button id="toggleSidebar" className="sm:hidden bg-blue-700 px-4 py-2 rounded">Toggle Sidebar</button>
                <button onClick={openNewTab} className="gradient-bg px-4 py-2 rounded">New Tab</button>
                <h1 className="text-2xl font-bold">Ollama WebUI</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="loader">Loading...</div>
                    </div>
                ) : (
                    <div className="">
                        {messages.map((msg, index) => (
                            <div className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} key={index}>
                                <div className={`rounded-lg p-4 shadow-lg max-w-2xl ${msg.role === 'user' ? 'bg-white' : 'bg-yellow-200'}`}>
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        className="prose"
                                    >
                                        {msg.message}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <footer className="p-4 bg-white border-t sticky bottom-0 shadow-md">
                <div className="flex">
                    <TextareaAutosize
                        className="flex-grow p-2 border rounded-l-lg focus:border-yellow-500 resize-none overflow-hidden"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        maxRows={6}
                        minRows={1}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="gradient-bg text-white px-4 py-2 rounded-r-lg hover:bg-yellow-700 transition-colors duration-200"
                        onClick={sendMessage}
                    >
                        Send
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default Chat;