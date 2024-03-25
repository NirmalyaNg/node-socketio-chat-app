const users = [];

// Add User
function addUser({ id, username, room }) {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  if (!username || !room) {
    return {
      error: 'Username and room are required',
    };
  }
  const existingUser = users.find((user) => user.username === username && user.room === room);
  if (existingUser) {
    return {
      error: 'Username already in use',
    };
  }
  const user = { id, username, room };
  users.push(user);
  return { user };
}

// Remove User
function removeUser(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get User
function getUser(id) {
  return users.find((user) => user.id === id);
}

// Get Users in a Room
function getUsersInRoom(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
