const socket = io();

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
};

let members = new Map();
let my_id = '';
let cards = new Set();
let SWIPE = false;

const copyRoomInfo = () => {
  var copyText = document.getElementById('room-name-input');
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand('copy');
};

const roomJoinedUpdateDom = (name) => {
  let roomName = document.getElementById('room-name-input');
  let copyButton = document.getElementById('join-room-button');
  document.getElementById('room-help-p').innerText =
    'Copy room name and send to your friends!';
  roomName.readOnly = true;
  roomName.value = name;
  copyButton.innerText = 'Copy';
  copyButton.onclick = () => copyRoomInfo();
};

const joinRoom = () => {
  let room = document.getElementById('room-name-input').value;
  room = room ? room : getRandomRoom();

  socket.emit('join room', {
    name: getRandomName(),
    room: room,
    color: getRandomColor(),
  });
};

const startFeedback = () => {
  socket.emit('start feedback');
  document.getElementById('start-feedback-button').innerText = 'Loading...';
};

function submitMovieFeedback() {
  SWIPE = false;
  cards.forEach((card) => card.destroy());
  feedbackData.moviesLiked = Array.from(feedbackData.moviesLiked).map((id) =>
    Number(id)
  );
  feedbackData.moviesDisliked = Array.from(
    feedbackData.moviesDisliked
  ).map((id) => Number(id));
  socket.emit('submit feedback', feedbackData);
  let submitFeedback = document.getElementById('submit-feedback');
  submitFeedback.innerText = 'Loading...';
  submitFeedback.disabled = true;
}

const createMemberElement = (member) => {
  var { id, name, color, room, admin } = member;
  const el = document.createElement('p');
  if (admin) {
    name += ' (admin)';
  }
  if (id === my_id) {
    name += ' (you)';
  }
  el.innerHTML = name;
  el.className = 'member';
  el.style.color = color;
  return el;
};

const updateMembersDOM = () => {
  document.querySelector('.members-count').innerText = `${
    members.size
  } users in room ${members.entries().next().value[1].room}:`;
  document.querySelector('.members-list').innerHTML = '';
  for (const member of members) {
    document
      .querySelector('.members-list')
      .appendChild(createMemberElement(member[1]));
  }
};

socket.on('room joined', (data, m) => {
  my_id = data.id;
  members = new Map(m);
  const room = members.get(my_id).room;
  roomJoinedUpdateDom(room);
  updateMembersDOM();
  if (members.get(my_id).admin) {
    document.getElementById('start-feedback-div').hidden = false;
    document.getElementById('abort-submission-div').hidden = false;
  }
});

socket.on('user joined', (data, m) => {
  members = new Map(m);
  updateMembersDOM();
});

socket.on('feedback time', (data) => {
  document.getElementById('start-feedback-button').remove();
  vueConfig.data.carousels = [];
  data.forEach((movie) => {
    vueConfig.data.carousels.push({
      id: movie.id,
      title: movie.title,
      poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      overview: movie.overview,
    });
  });
  SWIPE = true;
  if (members.get(my_id).admin) {
    document.getElementById('progress-bar-div').hidden = false;
  }
});

socket.on('movies to watch', (data) => {
  vueConfig.data.carousels = [];
  data.forEach((movie) => {
    vueConfig.data.carousels.push({
      id: movie.id,
      title: movie.title,
      poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      backdrop_path: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
      overview: movie.overview,
    });
  });
  document.getElementById('swipe-container').hidden = true;
  document.getElementById('rec-container').hidden = false;
});

socket.on('error', (message) => {
  window.createNotification({
    closeOnClick: true,
    theme: 'error',
  })({
    message: message
  });
});

socket.on('user left', (data, m) => {
  members = new Map(m);
  updateMembersDOM();
});

socket.on('new admin', (m) => {
  members = new Map(m);
  updateMembersDOM();
});

socket.on('feedback update', (update) => {
  const progress = Object.keys(update).length / members.size;
  document.getElementById('progress-bar').value = `${progress * 100}`;
  document.getElementById('progress-bar').innerHTML = `${progress * 100}%`;
});

let feedbackData = {
  moviesLiked: new Set(),
  moviesDisliked: new Set(),
};

document.addEventListener('DOMContentLoaded', function () {
  var Direction = window.swing.Direction;
  let noWatchRec = document.getElementById('no-watch').getBoundingClientRect();
  let submitRec = document.getElementById('submit-div').getBoundingClientRect();

  const config = {
    minThrowOutDistance: submitRec.x - noWatchRec.x,
    maxThrowOutDistance: submitRec.x - noWatchRec.x + 3,
    maxRotation: window.innerWidth / 600,
    allowedDirections: [Direction.LEFT, Direction.RIGHT],
  };

  let stack;
  stack = window.swing.Stack(config);

  document.querySelectorAll('.my-card').forEach((targetElement) => {
    stack.createCard(targetElement);
  });

  stack.on('throwout', function (e) {
    const movieId = e.target.querySelector('img').id;
    if (e.throwDirection == Direction.RIGHT) {
      // movieId liked
      feedbackData.moviesDisliked.delete(movieId);
      feedbackData.moviesLiked.add(movieId);
    } else {
      // movieId disliked
      feedbackData.moviesLiked.delete(movieId);
      feedbackData.moviesDisliked.add(movieId);
    }
    cards.add(stack.getCard(e.target));
  });

  stack.on('throwin', function (e) {
    const movieId = e.target.querySelector('img').id;
    if (e.throwDirection == Direction.RIGHT) {
      // movieId was liked
      feedbackData.moviesLiked.delete(movieId);
    } else {
      // movieId was disliked
      feedbackData.moviesDisliked.delete(movieId);
    }
    cards.add(stack.getCard(e.target));
  });
});

let vueConfig = {
  data: {
    carousels: [
      {
        title: 'sajsl;dkf',
        overview:
          'as;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdf',
        poster_path:
          'https://image.tmdb.org/t/p/w500/hagf4LA3FRD2o1wI3LhNzl0t5vo.jpg',
        backdrop_path:
          'https://image.tmdb.org/t/p/original/7RIYU3mMHiK0QzMP8hG6IX4Sntl.jpg',
      },
      {
        title: 'sajsl;dkf',
        overview:
          'as;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdfas;ldkjfa;lskdf',
        poster_path:
          'https://image.tmdb.org/t/p/w500/hagf4LA3FRD2o1wI3LhNzl0t5vo.jpg',
        backdrop_path:
          'https://image.tmdb.org/t/p/original/7RIYU3mMHiK0QzMP8hG6IX4Sntl.jpg',
      },
    ],
  },
  updated() {
    this.$nextTick(function () {
      if (SWIPE) {
        document.getElementById('swipe-container').hidden = false;
        var DOMContentLoaded_event = document.createEvent('Event');
        DOMContentLoaded_event.initEvent('DOMContentLoaded', true, true);
        window.document.dispatchEvent(DOMContentLoaded_event);
      }
      let cardHolder = document.getElementById('card-rec-holder');
      if (cardHolder.firstElementChild)
        cardHolder.firstElementChild.className += ' active';
    });
  },
};

const app = new Vue(vueConfig);
app.$mount('#app');
