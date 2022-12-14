require("dotenv").config({path: 'config/.env'});
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const logger = require(`./logger.js`);
const PORT = process.env.PORT || 3001;
const dest = process.env.PROD_MAINSERVER_URL;

const app = express();
const server = app.listen(PORT, () => serLogger.info(`Live chat server running on ${PORT}`));

const io = socketio(server);
const serLogger = logger.log;

const admin = 'Chat Admin';

// Set static folder
app.use(express.static(path.join(__dirname, 'Frontend')))

// Runs when client connect to our sever
io.on('connection', socket => {
    serLogger.info("New connection to support live chat established");
    socket.on("joinChat", ({username}) => {

        socket.emit('message', formatMessage(admin, `Hey ${username}, welcome to support chat`));
        socket.broadcast.emit('message', formatMessage(admin, `${username} has joined chat...`));

        socket.on('typing', (data) => {
            socket.broadcast.emit('display', data)
        })

        socket.on('chatMessage', msg => {
            io.emit('message', formatMessage(username, msg));
        });

        socket.on('close', msg => {
            socket.broadcast.emit('message', formatMessage(admin, `${msg.user} ${msg.text}`));
            socket.emit('redirect', dest);
        });
    });
});



