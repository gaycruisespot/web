// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

// Replace 'your-backend-service-url' with your Render backend URL
const socket = io('https://web-mu2y.onrender.com');

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    const res = await axios.post('https://your-backend-service-url.onrender.com/login', { email, password });
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
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}

export default App;
