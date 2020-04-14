$(document).ready(function(){
  var socket = io.connect();
  // submit text message without reload/refresh the page
  $('#send').click(function(){
      const message = $('#chatbox').val();
      if(message != ""){
      socket.emit('chat_message', message);
      $('#chatbox').val('');
    }
  });
  // append the chat text message
  socket.on('chat_message', function(msg){

    if(name==msg.username){
      $('.main').append(`<div class="message_box">
      <div class="my">
        <div class="my_message">${msg.msg}</div>
      </div>
      </div>`);
    }else{


      $('.main').append(`<div class="message_box">
      	<div class="sender">${msg.username}</div>
      	<div class="message">${msg.msg}</div>
      </div>`);
    }
  });
  // append text if someone is online
  socket.on('is_online', function(username) {
      $('#messages').append($('<li>').html(username));
  });

  socket.on('joined_room', function(message) {
      $('#messages').append($('<li>').html(message));

  });

  socket.on('online', function(num, users) {
    $('#online').empty();
    $('#num').html(num);
    users.forEach(function(user){
      $('#online').append($('<p>').html(user));
    })


  });

  socket.on('whos_online', function(users) {
    users.forEach(function(user){
      $('#users').append($('<li>').html(user));
    })


  });
$('#temp').click(function(){
joinRoom();

})
var segment_str = window.location.pathname; // return segment1/segment2/segment3/segment4
var segment_array = segment_str.split( '/' );
var last_segment = segment_array.pop();
joinRoom(last_segment)
$('#leave').click(function(){
socket.emit('left', "Enterprise Web");

})
var name = "";
  function joinRoom(room){
    $.post("/savedMessages", {
      room: room
    },function(data){
      $('.main').empty();
      name = data.username;
      data.messages.forEach(function(message){
        if(data.username == message.sender){
          $('.main').append(`<div class="message_box">
          <div class="my">
          	<div class="my_message">${message.message}</div>
          </div>
          </div>`);
        }else{
        $('.main').append(`<div class="message_box">
        	<div class="sender">${message.sender}</div>
        	<div class="message">${message.message}</div>
        </div>`);
      }
      })
      socket.emit('username', room);
    })


    }
    $('#join-btn').click(function(){
      const room = $('#join-input').val();
      window.location.replace("/chat/"+room)
    })

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


function checkReg(username, pword, confirm){
  if(pword != confirm){
    return "Passwords do not match!";
  }

  if(username == "" || pword == "" || confirm == ""){
    return "Please complete all fields before submitting!"
  }
  return ""
}
  $('#register-btn').click(function(){
    const username = $('#username').val();
    const password = $('#password').val();
    const confirm = $('#confirm').val();

    let msg = ""
    msg = checkReg(username,password, confirm);
    if(msg==""){
      $.post('/register', {
        username : username,
        password: password
      }, function(data){
        $('#msg').html(data.msg)
        window.location.replace("/")
        if(data.errors){
            $('#msg').html(data.errors[0].msg);
        }

      });
    }else {
      $('#msg').html(msg)

    }
    })


    $('#show').mousedown(function(){
      $('#password').attr('type', 'text')
    })

    $('#show').mouseup(function(){
      $('#password').attr('type', 'password')
    })

    $('#show-confirm').mousedown(function(){
      $('#confirm').attr('type', 'text')
    })

    $('#show-confirm').mouseup(function(){
      $('#confirm').attr('type', 'password')
    })
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

        $('#change').click(function(){

          socket.emit('left');
          window.location.replace("/")
          });


})
