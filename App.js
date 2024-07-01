// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function App() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        socket.on('message', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });
    }, []);

    const sendMessage = () => {
        if (user && message) {
            socket.emit('message', { userId: user._id, message });
            setMessage('');
        }
    };

    const handleLogin = async () => {
        const res = await axios.post('http://localhost:5000/login', { email, password });
        setUser(res.data.user);
        socket.emit('join', { userId: res.data.user._id });
    };

    return (
        <div>
            {user ? (
                <>
                    <div>
                        {messages.map((msg, idx) => (
                            <div key={idx}>{msg.message}</div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </div>
    );
}

export default App;
