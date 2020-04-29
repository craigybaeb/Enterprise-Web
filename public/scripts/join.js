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
  var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
  var audio;
  isMac ? audio = new Audio('/audio/message.m4r') : audio = new Audio('/audio/message.mp3');


  socket.on('chat_message', function(msg){

    if(name==msg.username){
      const html = `<div class="message_box">
      <div class="my">
        <div class="my_message new"></div>
      </div>
      </div>`

      if($('.typing_message:first').length){
        $('.typing_message:first').parent().parent().before(html);
      }else{
        $('.main').append(html);
      }
      $('.my_message').last().text(msg.msg);
    }else{
      const html = `<div class="message_box">
        <div class="sender"></div>
        <div class="recieved">
        <div class="message new"></div>
        </div>
      </div>`

      if($('.typing_message:first').length){
        $('.typing_message:first').parent().parent().before(html);
      }else{
        $('.main').append(html);
      }
      $('.message').last().text(msg.msg);
      $('.sender').last().text(msg.username);
    }

    audio.play();
    scroll();

  });
  // append text if someone is online
  socket.on('is_online', function(username) {
      $('#messages').append($('<li>').html(username));
  });

  // append text if someone is online
  socket.on('typing', function(username) {
      $('.main').append(`<div id="${escape(username)}" class="message_box">
        <div class="recieved">
      	<div class="typing_message"></div>
        </div>
      </div>`);
      $('.typing_message').last().text(`${username} is typing...`);
  });

  socket.on('stopped_typing', function(username) {
      $(`#${escape(username)}`).remove();
  });

  socket.on('joined_chat', (username) => {
      $('.main').append(`<div class="message_box">
        <div class="recieved">
      	<div class="join_message"></div>
        </div>
      </div>`);
      $('.join_message').last().text(`${username} joined the chat.`);
      scroll();

  });

  socket.on('left_chat', (username) => {
      $('.main').append(`<div class="message_box">
        <div class="recieved">
      	<div class="join_message"></div>
        </div>
      </div>`);
      $('.join_message').last().text(`${username} left the chat.`);
      scroll();

  });

  socket.on('online', function(num, users) {
    $('#online').empty();
    $('#num').html(num);
    users.forEach(function(user){
      $('#online').append($('<p>').text(user));
    })


  });

var segment_str = window.location.pathname; // return segment1/segment2/segment3/segment4
var segment_array = segment_str.split( '/' );
var last_segment = segment_array.pop();
joinRoom(last_segment)
$('#leave').click(function(){
socket.emit('left', "Enterprise Web");

})
window.onbeforeunload = function(event) {
    socket.emit('left');
    return
};
$(window).on('hashchange', function(e){
  e.preventDefault();
  alert()
  let url = this.href;
  socket.emit('left', "Enterprise Web");

})
var name = "";
  function joinRoom(room){
    $.get(`/room/${room}/messages`,function(data){
      $('.main').empty();
      name = data.username;
      data.messages.forEach(function(message){
        if(data.username == message.sender){
          $('.main').append(`<div class="message_box">
          <div class="my">
          	<div class="my_message"></div>
          </div>
          </div>`);
          $('.my_message').last().text(message.message);
        }else{
        $('.main').append(`<div class="message_box">
        	<div class="sender"></div>
          <div class="recieved">
        	<div class="message"></div>
          </div>
        </div>`);
        $('.message').last().text(message.message);
        $('.sender').last().text(message.sender);
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

          function scroll(){
              $(".main").animate({ scrollTop: $('.main').prop("scrollHeight")}, 1000);
          }

          $('#chatbox').keydown(()=>{
            if(typing == false) {
              typing = true
              socket.emit('typing');
              timeout = setTimeout(timeoutFunction, 5000);
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(timeoutFunction, 5000);
                //socket.emit('stopped_typing')
              }

          })

          var typing = false;
var timeout = undefined;

function timeoutFunction(){
  typing = false;
  socket.emit('stopped_typing');
}


})