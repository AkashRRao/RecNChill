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
  document.getElementById('join-room-form').remove();
  let roomNameInput = document.createElement('input');
  let copyButton = document.createElement('button');
  roomNameInput.type = 'text';
  roomNameInput.id = 'room-info';
  roomNameInput.readOnly = true;
  copyButton.textContent = 'Copy';
  copyButton.onclick = () => copyRoomInfo();

  DOM.joinRoomDiv.appendChild(roomNameInput);
  DOM.joinRoomDiv.appendChild(document.createElement('br'));
  DOM.joinRoomDiv.appendChild(document.createElement('br'));
  DOM.joinRoomDiv.appendChild(copyButton);
  roomNameInput.value = room;
}

function copyRoomInfo() {
  var copyText = document.getElementById('room-info');
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand('copy');
}

socket.on('room joined', (data, m) => {
  my_id = data.id;
  members = new Map(m);
  console.log('room joined', members);
  updateMembersDOM();
});

socket.on('user joined', (data, m) => {
  console.log(data.name, 'joined the room.');
  members = new Map(m);
  updateMembersDOM();
});

socket.on('user left', (data, m) => {
  console.log(data.name, 'left the room.');
  members = new Map(m);
  updateMembersDOM();
});

socket.on('new admin', (m) => {
  console.log('I am the new admin now.');
  members = new Map(m);
  updateMembersDOM();
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
