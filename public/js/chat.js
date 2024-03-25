const messageForm = document.querySelector('#message-form');
const messageInput = messageForm.querySelector('#message-input');
const messageSubmitButton = messageForm.querySelector('#message-submit-button');
const messageLocationButton = document.querySelector('#message-location-button');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;
const messages = document.querySelector('#messages');

const socket = io();
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

function autoScroll() {
  const newMessage = messages.lastElementChild;
  const newMessageHeight = newMessage.offsetHeight; // Height of the last message excluding margin
  const newMessageStyles = getComputedStyle(newMessage); // Get computed styles for the new message element
  const newMessageMarginBottom = parseInt(newMessageStyles.marginBottom);
  const newMessageTotalHeight = newMessageHeight + newMessageMarginBottom;

  const visibleHeightContainer = messages.offsetHeight; // Visible Height of messages container (scrolling not considered)
  const containerHeight = messages.scrollHeight;

  // How far I have scrolled ?
  const scrollOffset = messages.scrollTop + visibleHeightContainer;
  if (containerHeight - newMessageTotalHeight <= scrollOffset) {
    messages.scrollTop = containerHeight;
  }
}

// Listen to message event from server
socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    messageText: message.text,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// Listen to location event from server
socket.on('location', (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

// Listen to roomData event from server
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    users,
    room,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

// Send Message
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const enteredMessage = messageInput.value;
  messageSubmitButton.setAttribute('disabled', 'disabled');

  // Send message to server
  socket.emit('sendMessage', enteredMessage, (error) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent succesfully');
    messageInput.value = '';
    messageSubmitButton.removeAttribute('disabled');
    messageInput.focus();
  });
});

// Send Location
messageLocationButton.addEventListener('click', () => {
  if (window.navigator && window.navigator.geolocation) {
    messageLocationButton.setAttribute('disabled', 'disabled');

    window.navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      socket.emit('sendLocation', { latitude, longitude }, () => {
        console.log('Location sent successfully');
        messageLocationButton.removeAttribute('disabled');
      });
    });
  }
});

// Emit join event to server
socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
