$(document).ready(() =>{

/* On-click Handlers Start */

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
        $('#msg').append(data.responseJSON.msg); //Display the error message from the server
    })

  }); //End of join-btn() click handler

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

        //User failed to be created
        .fail((data) => {
          $('#msg').empty(); //Clear the previous errors

          //Print each error recieved from the server
          data.responseJSON.msg.forEach((msg)=>{
            $('#msg').append(msg + "<br><br>"); //Output the error
          })
        }) //End request

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
        //Confirm with user this is what they want
        if (confirm("Are you sure about this? Once deleted, you cannot get the room back!")){
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
        } //End confirm
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
/* On-Click Handlers End */

//Register
const doRegister = () => {
  //Fetch the data from the form
  const username = $('#username').val();
  const password = $('#password').val();
  const confirm = $('#confirm').val();

    //Send a request to the server to register a new user
    $.post('/user', {
      //Send the data from the form
      username : username,
      password: password,
      confirm: confirm })

      //User created succesfully
      .done((msg) => {
        $('#msg').html(msg.msg); //Display acknowlegment
        window.location.replace("/"); //Redirect the browser
      })

      //User failed to be created
      .fail((data) => {
        $('#msg').empty(); //Clear the previous errors

        //Print each error recieved from the server
        data.responseJSON.msg.forEach((msg)=>{
          $('#msg').append(msg + "<br><br>"); //Output the error
        })

      }) //End request
} //End doRegister()


      //Login
      const doLogin = () => {

        //Send a request to the server to login
        $.ajax('/login', {
         type: "POST", //HTTP POST method will be used to hide credentials in body

         //Send the data from the login form
         data: {
           username : $('#username').val(),
           password : $('#password').val()
         },

         //Print output according to server response
         statusCode: {

           //Server responds with 200: Success Code
            200: (data) => {
              $('#msg').html(data.msg); //Display 'Welcome Back' message
              window.location.replace("/"); //Redirect browser
            },

            //Server responds with 429: Too Many Login Attempts
            429: (response) => {
              $('#msg').html(response.responseText); //Display error message from server
            },

            //Server responds with 401: Password incorrect
            401: (response) => {
              $('#msg').html(response.responseJSON.msg); //Display error message from server
            },

            //Server responds with 404: User not found
            404: (response) => {
              $('#msg').html(response.responseJSON.msg); //Display error message from server
            }
         } //End statusCode()
       }); //End request
     } //End doLogin()
})
