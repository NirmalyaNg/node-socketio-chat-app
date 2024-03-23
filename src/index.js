const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

// Socket connection is estabilished
io.on('connection', (socket) => {
  socket.emit('message', 'Welcome to Chat App !');

  socket.broadcast.emit('message', 'A new user has joined !');

  // Listen to sendMessage event from client
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity not allowed');
    }
    io.emit('message', message);
    callback();
  });

  // Listen to sendLocation event from client
  socket.on('sendLocation', (location, callback) => {
    io.emit(
      'location',
      `https://google.com/maps?q=${location.latitude},${location.longitude}`
    );
    callback();
  });

  // Listen to socket disconnect event
  socket.on('disconnect', () => {
    io.emit('message', 'An user just left !');
  });
});

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
