$(document).ready(function(){
  var socket = io.connect();
  // submit text message without reload/refresh the page
  $('form').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat_message', $('#txt').val());
      $('#txt').val('');
      return false;
  });
  // append the chat text message
  socket.on('chat_message', function(msg){
      $('#messages').append($('<li>').html(msg));
  });
  // append text if someone is online
  socket.on('is_online', function(username) {
      $('#messages').append($('<li>').html(username));
  });

  // append text if someone is online
  socket.on('saved_messages', function(messages) {
    $('#messages').empty();
    $('#messages').append($('<li>').html(msg));
  });

  socket.on('joined_room', function(message) {
      $('#messages').empty()
      $('#messages').append($('<li>').html(message));

  });

  function joinRoom(room){

    $.post("/savedMessages", {
      room: room
    },function(messages){
      console.log(messages)
      $('#messages').empty();
      messages.forEach(function(message){
        $('#messages').append($('<li>').html('<strong>' + message.sender + '</strong>: ' + message.message));
      })
      socket.emit('username', room);
    })


    }

  $('.room').each(function(){
    var thisroom = $(this).html();
    $(this).click(function(){
      joinRoom(thisroom);
    })
  })



$('#login-btn').click(function(){
    $.ajax('/login', {
   type: "POST",
   data: {
     username : $('#username').val(),
     password : $('#password').val()
   },
   statusCode: {
      200: function (data) {
        $('#msg').html(data.msg)
        if(data.match){
          window.location.replace("/")
        }
      },
      429: function (response) {
        $('#msg').html(response.responseText);
            }
   }
 });
});

  $('#register-btn').click(function(){
      $.post('/register', {
        username : $('#username').val(),
        password : $('#password').val()
      }, function(data){

      });
    });

    $('#addroom-btn').click(function(){
        $.post('/addroom', {
          username : $('#username').val()
        }, function(data){

        });
      });

      $('#logout').click(function(){
        $.post('/logout', function(){
            window.location.replace("/login")

        })

        });
})
