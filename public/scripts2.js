$(document).ready(function(){
  // var socket = io.connect();
  // // submit text message without reload/refresh the page
  // $('form').submit(function(e){
  //     e.preventDefault(); // prevents page reloading
  //     socket.emit('chat_message', $('#txt').val());
  //     $('#txt').val('');
  //     return false;
  // });
  // // append the chat text message
  // socket.on('chat_message', function(msg){
  //     $('#messages').append($('<li>').html(msg));
  // });
  // // append text if someone is online
  // socket.on('is_online', function(username) {
  //     $('#messages').append($('<li>').html(username));
  // });
  //
  // // append text if someone is online
  // socket.on('saved_messages', function(messages) {
  //   console.log(messages)
  // });
  //
  // socket.on('joined_room', function(message) {
  //     $('#messages').empty()
  //     $('#messages').append($('<li>').html(message));
  //
  // });
  //
  // function joinRoom(room){
  //
  //   $.post("/savedMessages", {
  //     room: room
  //   },function(messages){
  //     console.log(messages)
  //     messages.forEach(function(message){
  //       $('#messages').append($('<li>').html('<strong>' + message.sender + '</strong>: ' + message.message));
  //     })
  //   })
  //   socket.emit('username', "Craigy", room);
  //
  //   }
  //
  //
  // $('#hci').click(function(){
  //   joinRoom("Human Computer Interaction")
  // })
  //
  // $('#enterprise').click(function(){
  //   joinRoom("Enterprise Web")
  // })
  //
  // $('#webSec').click(function(){
  //   joinRoom("Web Security")
  // })



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
        $('#msg').html(data);
        window.location.replace("/")
      }).fail(function(response){
          let msg = response.responseJSON.errors[0].msg + "\n";

          for(i=1; i<response.responseJSON.errors.length; i++){
            msg+= response.responseJSON.errors[i].msg + "\n";
          }

          $('#msg').html(msg);

      });
    });

    $('#addroom-btn').click(function(){
        $.post('/addroom', {
          room : $('#addroom').val()
        }, function(data){

        });
      });

      $('#getroom-btn').click(function(){
          $.get('/getroom', function(data){
            $('#msg').html(data.msg);
          });
        });

      $('#show').mousedown(function(){
        $('#password').attr('type', 'text')
      })

      $('#show').mouseup(function(){
        $('#password').attr('type', 'password')
      })
})