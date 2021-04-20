const { getMovieFromTmdbId } = require('./utils');
const axios = require('axios');

const roomState = {
  USERS_JOINING: 'USERS_JOINING',
  GETTING_FEEDBACK: 'GETTING_FEEDBACK',
  SHOW_MOVIES: 'SHOW_MOVIES',
};

const PYTHON_SERVER_HOSTNAME = 'http://localhost:8000'

let socketIdToRoom = new Map();
let nameToRoom = new Map();
let io = null;

module.exports = class Room {
  constructor(name) {
    this.state = roomState.USERS_JOINING;
    this.name = name;
    this.members = new Map(); // map from socket.id to user_data
    this.feedback = new Map();
    this.admin = null;
    nameToRoom.set(name, this);
  }

  size() {
    return this.members.size;
  }

  static setSocketIO(io_) {
    io = io_;
  }

  static joinRoom(socket, name, color, roomName) {
    let room = nameToRoom.get(roomName);
    if (!room) {
      nameToRoom.set(roomName, new Room(roomName));
      room = nameToRoom.get(roomName);
    }
    room.joinRoom(socket, name, color);
  }

  joinRoom(socket, name, color) {
    if (this.state !== roomState.USERS_JOINING) {
      socket.emit('error', 'you cannot join this room right now');
      return;
    }

    if (this.admin === null) {
      this.admin = socket.id;
    }

    const data = {
      id: socket.id,
      name: name,
      color: color,
      room: this.name,
      admin: socket.id === this.admin,
    };

    socket.join(this.name);
    this.members.set(socket.id, data);
    socketIdToRoom.set(socket.id, this);
    // emit their information and the members in the room.
    socket.emit('room joined', data, Array.from(this.members.entries()));
    // emit to other users that new user has joined.
    socket.broadcast
      .to(this.name)
      .emit('user joined', data, Array.from(this.members.entries()));
  }

  static leaveRoom(socket) {
    let room = socketIdToRoom.get(socket.id);

    if (room) {
      room.leaveRoom(socket);
      socketIdToRoom.delete(socket.id);
      if (room.size() === 0) {
        nameToRoom.delete(room.name);
      }
    }
  }

  leaveRoom(socket) {
    const deletedUser = this.members.get(socket.id);
    this.members.delete(socket.id);

    if (this.size() > 0) {
      // make someone else the admin.
      this.admin = this.members.entries().next().value[0];
      this.members.get(this.admin).admin = true;
      // emit to new admin that they're admin.
      socket
        .to(this.admin)
        .emit('new admin', Array.from(this.members.entries()));
      // emit to other users that user has left.
      socket.broadcast
        .to(this.name)
        .emit('user left', deletedUser, Array.from(this.members.entries()));
    }
  }

  static startFeedback(socket) {
    let room = socketIdToRoom.get(socket.id);

    if (room) {
      room.startFeedback(socket);
    }
  }

  async startFeedback(socket) {
    if (this.state !== roomState.USERS_JOINING) {
      socket.emit('error', 'you cannot start feedback for room now');
      return;
    }

    if (socket.id !== this.admin) {
      socket.emit(
        'error',
        'you are not the admin of the group, request the admin to start feedback'
      );
      return;
    }

    let result = await axios.get(
      `${PYTHON_SERVER_HOSTNAME}/initial-feedback/`
    );
    result = result.data;

    let movieData = new Array();
    await Promise.all(
      result.movies.map(async (movie) => {
        const movieDetails = await getMovieFromTmdbId(movie.tmdbId);
        if (Object.keys(movieDetails).length) movieData.push(movieDetails);
      })
    );

    this.state = roomState.GETTING_FEEDBACK;
    io.to(this.name).emit('feedback time', movieData);
  }

  static submitFeedback(socket, feedback) {
    let room = socketIdToRoom.get(socket.id);

    if (room) {
      room.submitFeedback(socket, feedback);
    }
  }

  async submitFeedback(socket, feedback) {
    if (this.state !== roomState.GETTING_FEEDBACK) {
      socket.emit('error', 'you cannot submit feedback now');
      return;
    }

    if (feedback.moviesLiked && feedback.moviesDisliked) {
      this.feedback.set(socket.id, feedback);
      io.to(this.admin).emit(
        'feedback update',
        Object.fromEntries(this.feedback)
      );
    }

    if (this.feedback.size === this.members.size) {
      // everyone has submitted their feedback
      let result = await axios.post(
        `${PYTHON_SERVER_HOSTNAME}/get-recommendations/`,
        Object.fromEntries(this.feedback)
      );

      result = result.data;
      let movieData = new Array();
      await Promise.all(
        result.movies.map(async (movie) => {
          const movieDetails = await getMovieFromTmdbId(movie.tmdbId);
          if (Object.keys(movieDetails).length) movieData.push(movieDetails);
        })
      );
      this.state = roomState.SHOW_MOVIES;
      io.to(this.name).emit('movies to watch', movieData);
    }
  }
};
