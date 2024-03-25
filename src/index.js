const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateLocationMessage, generateTextMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
const PORT = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));

// Socket connection is estabilished
io.on('connection', (socket) => {
  // Listen to join event
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    // Join the room
    socket.join(user.room);

    socket.emit(
      'message',
      generateTextMessage('Admin', `Welcome ${user.username} to the Chat App!`)
    );
    socket.broadcast
      .to(user.room)
      .emit('message', generateTextMessage('Admin', `${user.username} has joined !`));

    // Emit event to all users in a room and provide data of all joined users to that room
    const roomData = getUsersInRoom(user.room);
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: roomData,
    });
    callback();
  });

  // Listen to sendMessage event from client
  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback('Profanity not allowed');
    }
    io.to(user.room).emit('message', generateTextMessage(user.username, message));
    callback();
  });

  // Listen to sendLocation event from client
  socket.on('sendLocation', (location, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      'location',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${location.latitude},${location.longitude}`
      )
    );
    callback();
  });

  // Listen to socket disconnect event
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        'message',
        generateTextMessage('Admin', `${user.username} just left !`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
