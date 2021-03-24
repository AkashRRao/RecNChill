const socket = io();

let members = new Map();
let my_id = '';

socket.emit('join room', { name: getRandomName(), color: getRandomColor() });

socket.on('room joined', (data, m) => {
  my_id = data.id;
  members = new Map(m);
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

const DOM = {
  membersCount: document.querySelector('.members-count'),
  membersList: document.querySelector('.members-list'),
};

function createMemberElement(member) {
  var { id, name, color, admin } = member;
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
  DOM.membersCount.innerText = `${members.size} users in room:`;
  DOM.membersList.innerHTML = '';
  for (const member of members) {
    DOM.membersList.appendChild(createMemberElement(member[1]));
  }
}
