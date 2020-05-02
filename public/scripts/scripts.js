$(document).ready(() =>{

/* On-click Handlers Start */

  //'Leave' button is clicked
  $('#leave').click(() => socket.emit('left'));

  //'Join' button  is clicked
  $('#join-btn').click(() =>{
    const room = $('#join-input').val(); //Get room from input

    $.get(`/room/${room}`) //Request to join the room

    //Success
    .done((data) =>{
      $('#msg').html(`Joining ${room}...`); //Display event message on screen
      window.location.replace(`/room/${room}`); //Redirect browser to room
    })

    //Failure
    .fail((data) =>{
        $('#msg').append(data.responseJSON.msg);
    })

  }); //End of join-btn() click handler

  //'Send' button is clicked
  $('#send').click(() =>{
    //Get message from input box
    const message = $('#chatbox').val();

    //Check if field is empty
    if(message != ""){
      socket.emit('chat_message', message); //Broadcast message to server
      $('#chatbox').val(''); //Reset input box
    }
  });

  //'Login' button is clicked
  $('#login-btn').click(() => doLogin()); //Attempt login

  //'Logout' button is clicked
  $('#logout').click(() => $.get('/logout', () => { //Tell the server to log the user out
        window.location.replace("/login"); //Redirect the browser to the login page
  }));

  //'Add Room' button is clicked
  $('#add-btn').click(() =>{

      //Send the room to the server to be added
      $.post('/room', {
        room : $('#addinput').val()}) //Name of the room to be sent

        //Success
        .done((data) =>{
          $('#msg').html(data.msg); //Display the servers response
        })

        //Failure
        .fail((data) =>{
          $('#msg').html(data.responseJSON.msg); //Display the servers response
        })

  });

  //'Change Privileges' button is clicked
  $('#priv-btn').click(() =>{

      //Get data from inputs
      const username = $('#priv-user-input').val(); //Username to alter privileges
      const privilege = $('#priv-input').val(); //Admin level

      //Send AJAX PUT request to server to change a user's privileges
      $.ajax({
        url: '/user/' + escape(username), //Escape the username to work as URL (Example: '/user/Craig%20Pirie')
        type: 'PUT', //PUT is representative of the UPDATE operation
        data : { priv: privilege }, //Data to be sent in body of HTTP request
        success: (result) => {
          //Display message on success
          $('#msg').html(result.msg)
        }, //End success callback
        error: (xhr) =>{
          //Display errors
          $('#msg').empty(); //Clear the errors

          //Loop for each error message recieved
          xhr.responseJSON.msg.forEach((msg) =>{
            $('#msg').append(msg);
          });
        } //End error callback
      }); //End request
    }); //End on-click handler

    //'Delete' button is clicked
    $('#delete-btn').click(() =>{
        confirm("are you sure")
        //Get room from input
        const room = $('#delete-input').val();

        //Send AJAX DELETE request
        $.ajax({
          url: `/room/${room}`, //Example: '/room/Enterprise%20Web'
          type: 'DELETE', //Request type matches semantically with operation
          success: (result) => { //Result recieved from server
            //Display success message
            $('#msg').html(result.msg)
            $(`#delete-input option[value='${room}']`).remove();
          }, //End success message
          error: (xhr) =>{
            //Display errors
            $('#msg').empty(); //Clear the errors

            //Loop for each error message recieved
            xhr.responseJSON.msg.forEach((msg) =>{
              $('#msg').append(msg);
            });
          } //End error callback
        }); //End request
      }); //End on-click handler

      //'Register' button is clicked
      $('#register-btn').click(() => doRegister());

      /* Mousedown Handlers */
        //Reveal password while mouse is held down
        $('#show').mousedown(() => $('#password').attr('type', 'text')); //Change input type to text

        //Reveal confirm-password while mouse is held down
        $('#show-confirm').mousedown(() => $('#confirm').attr('type', 'text')); //Change input type to text
      /* Mousedown End */

      /* Mouseup Handlers */
        //Hide password when mouse is released
        $('#show').mouseup(() => $('#password').attr('type', 'password')); //Change input type to password

        //Hide confirm-password when mouse is released
        $('#show-confirm').mouseup(() => $('#confirm').attr('type', 'password')); //Change input type to password
      /* Mouseup Handlers End */

      /* Keyup handlers */
        $('#chatbox').keyup((event) => {
          if(event.keyCode === 13){
            event.preventDefault();
            $('#send').click();
          };
        });
      /* Keyup handlers End*/

/* On-Click Handlers End */


/* Socket.io functions */
  //Connect to socket.io
  var socket = io.connect();
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

    const doRegister = () => {
      const username = $('#username').val();
      const password = $('#password').val();
      const confirm = $('#confirm').val();

      //let msg = ""
      //msg = checkReg(username,password, confirm);

        $.post('/user', {
          username : username,
          password: password,
          confirm: confirm })
          .done((msg) => {
            $('#msg').html(msg.msg);
            window.location.replace("/")
          })
          .fail((data) => {
            $('#msg').empty(); //Clear the errors
            data.responseJSON.msg.forEach((msg)=>{
              $('#msg').append(msg + "<br><br>");
            })
          })




    }

          const doLogin = () => {
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
              },
              401: (response) => {
                $('#msg').html(response.responseJSON.msg)
              },
              404: (response) => {
                $('#msg').html(response.responseJSON.msg)
              },
           }
         });
          }


})
