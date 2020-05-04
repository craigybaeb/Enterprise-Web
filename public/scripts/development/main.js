$(document).ready(() => {
  //Set global variables
  let typing = false; //Is the user typing
  let timeout = undefined; //Time left before user is determined not to be typing
  let name = ""; //Current user's name

  //Set the audio files for the message sending
  const isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
  let audio;
  isMac ? audio = new Audio('/audio/message.m4r') : audio = new Audio('/audio/message.mp3');

  //On-click handler for send button
  $('#send').click(() => {
      const message = $('#chatbox').val(); //Get the message from the chatbox

      //Send the message if not blank
      if(message != ""){
        socket.emit('chat_message', message); //Send the message to the server to broadcast to all users
        $('#chatbox').val(''); //Reset the chatbox
      }
  });

  /* Keyup handlers */
    //Check if user presses enter in chatbox to send message
    $('#chatbox').keyup((event) => {
      //Button has been pressed in chatbox, check if it is 'Enter' key
      if(event.keyCode === 13){ //Is Enter
        event.preventDefault(); //Prevent default behaviour
        $('#send').click(); //Send the message
      };
    });
  /* Keyup handlers End*/

  /* Socket.io section */
  //Connect to socket.io
    const socket = io.connect();

    //Handle the reception of a message
    socket.on('chat_message', (msg) => {

    //Check if the message is from the user themself
    if(name==msg.username){ //User sent this
      //Build HTML message to add to messages
      const html = `<div class="message_box">
                      <div class="my">
                        <div class="my_message new"></div>
                      </div>
                    </div>`

      //Check if someone is typing to add the message on top of this box
      if($('.typing_message:first').length){ //Somone is typing
        $('.typing_message:first').parent().parent().before(html); //Append message before the "Someone is typing..." box
      }else{ //Noone is typing
        $('.main').append(html); //Message can be appended to bottom of messages
      }

      //Insert message text into appended message, to avoid XSS attacks
      $('.my_message').last().text(msg.msg);

    }else{ //Someone else sent the message

      //Build the HTMl to be appended to messages
      const html = `<div class="message_box">
                      <div class="sender"></div>
                      <div class="recieved">
                        <div class="message new"></div>
                      </div>
                    </div>`

      //Check if someone is typing to add the message on top of this box
      if($('.typing_message:first').length){ //Someone is typing
        $('.typing_message:first').parent().parent().before(html); //Append message before the "Someone is typing..." box
      }else{ //Noone is typing
        $('.main').append(html); //Message can be appended to end of messages
      }

      //Insert message and sender text into appended message, to avoid XSS attacks
      $('.message').last().text(msg.msg); //Message text
      $('.sender').last().text(msg.username); //Username
    }

    //Notify user of message
    audio.play(); //Play notification sound
    scroll(); //Scroll to bottom
  });


  //Handle reception of alert that someone is typing
  socket.on('typing', (username) => {
      //Build the HTML message to append
      $('.main').append(`<div id="${escape(username)}" class="message_box">
                            <div class="recieved">
      	                       <div class="typing_message"></div>
                            </div>
                         </div>`);

      //Insert message text into built message to avoid XSS
      $('.typing_message').last().text(`${username} is typing...`);
      scroll(); //Scroll to bottom
  });

  //Handle reception of alert that someone stopped typing
  socket.on('stopped_typing', (username) => {
      $(`#${escape(username)}`).remove();
  });

  //Handle event of user joining chat
  socket.on('joined_chat', (username) => {
    //Build the HTML message
    $('.main').append(`<div class="message_box">
                        <div class="recieved">
    	                   <div class="join_message"></div>
                        </div>
                       </div>`);

    //Insert message text into built message to avoid XSS
    $('.join_message').last().text(`${username} joined the chat.`);

    //Notify user
    scroll(); //Scroll to bottom of the screen
});

//Handle event that someone left the chat
socket.on('left_chat', (username) => {
    //Build the HTML message
    $('.main').append(`<div class="message_box">
                          <div class="recieved">
    	                       <div class="join_message"></div>
                          </div>
                       </div>`);

    //Insert message text into built message to avoid XSS
    $('.join_message').last().text(`${username} left the chat.`);

    //Notify user
    scroll(); //Scroll to bottom of the screen
});

//Update the number of online users when someone joins/leaves room
socket.on('online', (num, users) => {
  //Update total number of online users in room
  $('#num').html(`Online: ${num}`);

  //Update users
  $('#online').empty(); //Empty users from dropdown box
  users.forEach((user) => {
    $('#online').append($('<p>').text(user)); //Add user to dropdown
  })

});

//Broadcast a  message to leave the chat before navigating away from page
window.onbeforeunload = (event) => {
  socket.emit('left'); //Alert server of user leaving
  return
};


const joinRoom = () => {

  //Fetch room from URL
  const url = window.location.pathname; //Get the URL
  const url_array = url.split( '/' ); //Split the URL into an array
  const room = url_array.pop(); //Get the room from the split URL array

  //First, get the messages from the room
  $.get(`/room/${room}/messages`, (data) => {
    $('.main').empty(); //Messages should be empty but double check
    name = data.username; //Set the user to the one recieved from server

    //Display each message on the screen
    data.messages.forEach((message) => {
      //Check if user sent the message or someone else
      if(data.username == message.sender){ //User sent it
        //Add message to chat
        $('.main').append(`<div class="message_box">
                            <div class="my">
        	                    <div class="my_message"></div>
                            </div>
                           </div>`);

        //Insert message text this way to avoid XSS
        $('.my_message').last().text(message.message);

      }else{ //User did not send this message
        //Add message to chat
        $('.main').append(`<div class="message_box">
        	                   <div class="sender"></div>
                             <div class="recieved">
        	                     <div class="message"></div>
                             </div>
                            </div>`);

      //Insert message and sender text this way to avoid XSS
      $('.message').last().text(message.message); //Message text
      $('.sender').last().text(message.sender); //Who sent the message
      }
    })

    //Get socket.io to add user to room
    socket.emit('username', room);
  })
}

//Function to scroll to bottom of messages
const scroll = () => {
    $(".main").animate({ scrollTop: $('.main').prop("scrollHeight")}, 1000); //Scroll
}

//Check for activity on the chatbox
$('#chatbox').keydown(()=>{
  //User is typing, determine if they just started or if it is continued
  if(typing == false) { //Just started typing
    typing = true; //Set typing to true so that server is not notified again
    socket.emit('typing'); //Inform server user is typing
    timeout = setTimeout(timeoutFunction, 5000); //Start typing timer before determining they have stopped

  } else { //User was in the middle of typing already
      //Reset the typing timer;
      clearTimeout(timeout);
      timeout = setTimeout(timeoutFunction, 5000);
    }
  })


  //Handle when user stops typing
  const timeoutFunction = () => {
    typing = false; //User has stopped typing
    socket.emit('stopped_typing'); //Alert server that user has stopped typing
  }

  /* Socket.io End */

  //Join the room
  joinRoom();
})
