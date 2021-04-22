const socket = io();

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
  joinRoomDiv: document.querySelector('.join-room'),
};

let members = new Map();
let my_id = '';

function joinRoom() {
  let room = document.getElementById('room-name').value;
  room = room ? room : getRandomRoom();

  socket.emit('join room', {
    name: getRandomName(),
    room: room,
    color: getRandomColor(),
  });
  document.getElementById('join-room').remove();
  let roomName = document.getElementById('room-name');
  let copyButton = document.createElement('button');
  document.getElementById('room-help').innerText =
    'Copy room name and send to your friends!';
  roomName.readOnly = true;
  roomName.value = room;
  copyButton.className = 'btn btn-primary';
  copyButton.innerText = 'Copy';
  copyButton.onclick = () => copyRoomInfo();
  document.getElementById('join-room-form').parentNode.append(copyButton);
}

function copyRoomInfo() {
  var copyText = document.getElementById('room-name');
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand('copy');
}

function startFeedback() {
  socket.emit('start feedback');
  document.getElementById('start-feedback-button').innerText = 'Loading...';
}

socket.on('feedback time', (data) => {
  document.getElementById('start-feedback-button').remove();
  let cardHolder = document.getElementById('card-holder');
  data.forEach((movie) => {
    let card = document.createElement('div');
    card.className = 'card my-card';
    let img = document.createElement('img');
    img.id = movie.id;
    img.src = `http://image.tmdb.org/t/p/w500${movie.poster_path}`;
    img.className = 'card-img-top';
    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    let cardText = document.createElement('div');
    cardText.className = 'card-text';
    cardText.style.fontSize = '13px';
    cardText.innerText = movie.overview;
    let cardTitle = document.createElement('h5');
    cardTitle.innerText = movie.title;
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    card.appendChild(img);
    card.appendChild(cardBody);
    cardHolder.appendChild(card);
  });
  document.getElementById('swipe-container').hidden = false;
  var DOMContentLoaded_event = document.createEvent('Event');
  DOMContentLoaded_event.initEvent('DOMContentLoaded', true, true);
  window.document.dispatchEvent(DOMContentLoaded_event);
  if (members.get(my_id).admin) {
    document.getElementById('user-progress').hidden = false;
  }
});

socket.on('movies to watch', (data) => {
  let cardHolder = document.getElementById('card-rec-holder');
  data.forEach((movie) => {
    let card = document.createElement('div');
    card.className = 'carousel-item';
    let img = document.createElement('img');
    let smallimg = document.createElement('img');
    img.id = movie.id;
    img.src = `http://image.tmdb.org/t/p/original${movie.backdrop_path}`;
    img.className = 'd-block w-100 darken';
    smallimg.src = `http://image.tmdb.org/t/p/w500${movie.poster_path}`;
    smallimg.className = 'w-25 m-3';
    let cardBody = document.createElement('div');
    cardBody.className = 'carousel-caption d-none d-md-block';
    let title = document.createElement('h3');
    title.innerHTML = movie.title;
    let overview = document.createElement('p');
    overview.innerHTML = movie.overview;
    cardBody.appendChild(smallimg);
    cardBody.appendChild(title);
    cardBody.appendChild(overview);
    card.appendChild(img);
    card.appendChild(cardBody);
    cardHolder.appendChild(card);
  });
  cardHolder.firstElementChild.className += ' active';
  document.getElementById('swipe-container').hidden = true;
  document.getElementById('rec-container').hidden = false;
});

socket.on('room joined', (data, m) => {
  my_id = data.id;
  members = new Map(m);
  updateMembersDOM();
  if (members.get(my_id).admin) {
    document.getElementById('start-feedback').hidden = false;
  }
});

socket.on('user joined', (data, m) => {
  members = new Map(m);
  updateMembersDOM();
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
  document.getElementById('progress-bar').style.width = `${progress * 100}%`;
  document.getElementById('progress-bar').ariaValuenow = `${progress * 100}`;
});

function createMemberElement(member) {
  var { id, name, color, room, admin } = member;
  const el = document.createElement('div');
  if (admin) {
    name += ' (admin)';
  }
  if (id === my_id) {
    name += ' (you)';
  }
  el.appendChild(document.createTextNode(name));
  el.className = 'member';
  el.style.color = color;
  return el;
}

function updateMembersDOM() {
  DOM.membersCount.innerText = `${members.size} users in room ${
    members.entries().next().value[1].room
  }:`;
  DOM.membersList.innerHTML = '';
  for (const member of members) {
    DOM.membersList.appendChild(createMemberElement(member[1]));
  }
}
