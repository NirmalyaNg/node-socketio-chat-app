const messageForm = document.querySelector('#message-form');
const messageInput = messageForm.querySelector('#message-input');
const messageSubmitButton = messageForm.querySelector('#message-submit-button');
const messageLocationButton = messageForm.querySelector('#message-location-button');
const messageTemplate = document.querySelector('#message-template');
const locationTemplate = document.querySelector('#location-template');
const messages = document.querySelector('#messages');

const socket = io();

socket.on('message', (message) => {
  const html = messageTemplate.innerHTML;
  const template = Mustache.render(html, {
    messageText: message,
  });
  messages.insertAdjacentHTML('beforeend', template);
});

socket.on('location', (location) => {
  const html = locationTemplate.innerHTML;
  const template = Mustache.render(html, {
    location,
  });
  messages.insertAdjacentHTML('beforeend', template);
});

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
