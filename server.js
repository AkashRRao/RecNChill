// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

let members = new Map();

io.on('connection', (socket) => {
  // when a user joins the room.
  socket.on('join room', ({ name, color }) => {
    const data = {
      id: socket.id,
      name: name,
      color: color,
      admin: members.size === 0 ? true : false,
    };
    members.set(socket.id, data);
    // emit their information and the members in the room.
    socket.emit('room joined', data, Array.from(members.entries()));
    // emit to other users that new user has joined.
    socket.broadcast.emit('user joined', data, Array.from(members.entries()));
  });

  // when user leaves the room.
  socket.on('disconnect', () => {
    const deletedUser = members.get(socket.id);
    members.delete(socket.id);
    if (members.size > 0) {
      const newAdmin = members.entries().next().value[0];
      members.get(newAdmin).admin = true;
      // emit to new admin that they're admin.
      socket.to(newAdmin).emit('new admin', Array.from(members.entries()));
      // emit to other users that user has left.
      socket.broadcast.emit(
        'user left',
        deletedUser,
        Array.from(members.entries())
      );
    }
  });
});
