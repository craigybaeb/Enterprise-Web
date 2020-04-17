$(document).ready(() =>{
  var socket = io.connect();
  // submit text message without reload/refresh the page
  $('#send').click(() =>{
      const message = $('#chatbox').val();
      if(message != ""){
      socket.emit('chat_message', message);
      $('#chatbox').val('');
    }
  });
  // append the chat text message
  socket.on('chat_message', (msg) => {
    if(msg.sender==msg.username){
      $('.main').append(`<div class="message_box">
      <div class="my">
        <div class="my_message">${msg.msg}</div>
      </div>
      </div>`);
    }else{


      $('.main').append(`<div class="message_box">
      	<div class="sender">${msg.username}</div>
        <div class="recieved">
      	<div class="message">${msg.msg}</div>
        </div>
      </div>`);
    }
  });
  // append text if someone is online
  socket.on('is_online', (username) => {
      $('#messages').append($('<li>').html(username));
  });

  socket.on('joined_chat', (username) => {
      $('.main').append(`<div class="message_box">
        <div class="recieved">
      	<div class="join_message">${username} joined the chat.</div>
        </div>
      </div>`);

  });

  socket.on('online', (num, users) =>{
    $('#online').empty();
    $('#num').html(num);
    users.forEach((user) =>{
      $('#online').append($('<p>').html(user));
    })


  });

  socket.on('whos_online', (users) => {
    users.forEach((user) =>{
      $('#users').append($('<li>').html(user));
    })


  });
$('#temp').click(() =>{
joinRoom();

})

$('#leave').click(() =>{
socket.emit('left', "Enterprise Web");

})
  joinRoom = () => {
    $.post("/savedMessages", {
      room: "Enterprise Web"
    },(data) => {
      $('.main').empty();
      data.messages.forEach((message) =>{
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
      socket.emit('username');
    })


    }
    $('#join-btn').click(() =>{
      const room = $('#join-input').val()
      //$('#jform').attr('action', '/chat/'+room);
      //$('#jform').submit()
      window.location.replace(`/room/${room}`)

      $('#msg').html("Joining room...")
    })

  $('.room').each(() =>{
    var thisroom = $(this).html();
    $(this).click(() =>{
      joinRoom(thisroom);
    })
  })



$('#login-btn').click(() =>{
    $.ajax('/login', {
   type: "POST",
   data: {
     username : $('#username').val(),
     password : $('#password').val()
   },
   statusCode: {
      200: (data) => {
        $('#msg').html(data.msg)
        if(data.match){
          window.location.replace("/")
        }
      },
      429: (response) => {
        $('#msg').html(response.responseText);
            }
   }
 });
});


 checkReg = (username, pword, confirm) => {
  if(pword != confirm){
    return "Passwords do not match!";
  }

  if(username == "" || pword == "" || confirm == ""){
    return "Please complete all fields before submitting!"
  }
  return ""
}
  $('#register-btn').click(() =>{
    const username = $('#username').val();
    const password = $('#password').val();
    const confirm = $('#confirm').val();

    let msg = ""
    msg = checkReg(username,password, confirm);
    if(msg==""){
      $.post('/register', {
        username : username,
        password: password
      }, (data) => {
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


    $('#show').mousedown(() =>{
      $('#password').attr('type', 'text')
    })

    $('#show').mouseup(() =>{
      $('#password').attr('type', 'password')
    })

    $('#show-confirm').mousedown(() =>{
      $('#confirm').attr('type', 'text')
    })

    $('#show-confirm').mouseup(() =>{
      $('#confirm').attr('type', 'password')
    })
    $('#add-btn').click(() =>{
        $.post('/room', {
          room : $('#addinput').val()
        }, (data) => {
          $('#msg').html(data.msg)
        });
      });

      $('#delete-btn').click(() =>{
          const room = $('#delete-input').val();

          $.ajax({
            url: `/room/${room}`,
            type: 'DELETE',
            success: (result) => {
              $('#msg').html(result.msg)
            }
          });
        });

        $('#priv-btn').click(() =>{
          $.ajax({
            url: '/privilege',
            type: 'PUT',
            data : {username:$('#priv-user-input').val(),
                    priv:$('#priv-input').val()},
            success: (result) => {
              $('#msg').html(result.msg)
            }
          });

          });

      $('#logout').click(() => {
        $.get('/logout', () => {
            window.location.replace("/login")
        })

        });

        $('#change').click(() => {
          $.post('/logout', () => {
              window.location.replace("/login")

          })

          });


})
