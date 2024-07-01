// server.js
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const socketIO = require('socket.io');
const http = require('http');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.post('/signup', async (req, res) => {
    const { username, email, password, location } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, location });
    await user.save();
    res.status(201).send('User created');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});

io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
        socket.join(userId);
    });

    socket.on('message', async ({ userId, message }) => {
        const newMessage = new Message({ userId, message });
        await newMessage.save();
        io.to(userId).emit('message', newMessage);
    });
});

app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    location: String,
});

module.exports = mongoose.model('User', userSchema);

// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    userId: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
