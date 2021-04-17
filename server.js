// Setup basic express server
const express = require('express');
const app = express();
const Room = require('./Room');
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const { getMoviesFromQuery } = require('./utils');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Movie details ENDPOINT
app.get('/search/movie', async function (req, res) {
  response = {
    movies: [],
    error: '',
  };

  if (req.query.query === undefined) {
    response.error = 'query must be provided';
    res.send(response);
    return;
  }

  const result = await getMoviesFromQuery(req.query.query);
  res.send(result);
});

Room.setSocketIO(io);

// Room functionality
io.on('connection', (socket) => {
  // when a user joins the room.
  socket.on('join room', ({ name, room, color }) => {
    Room.joinRoom(socket, name, color, room);
  });

  // when user leaves the room.
  socket.on('disconnect', () => {
    Room.leaveRoom(socket);
  });

  // when the admin of the group wants to start feedback round.
  socket.on('start feedback', () => {
    Room.startFeedback(socket, io);
  });

  // when single user submits feedback
  socket.on('submit feedback', (feedback) => {
    Room.submitFeedback(socket, feedback);
  });
});
