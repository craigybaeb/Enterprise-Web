/* This module handles the socket.io connections for the server */

//Get the required model to interact with the database
const { messageTasks } = require('./loadModels');

//Export everything to be used in index.js
module.exports=  (session, server) => {
  //Configure socket.io
  const io = require('socket.io')(server); //Start socket.io

  //Allow socket.io access to session
  const sharedsession = require("express-socket.io-session");
  io.use(sharedsession(session, {autoSave:true}));

  //Keep a log of all active user instances
  const users = {};
  let count = 0;

  //Client connected to socket.io on server
  io.sockets.on('connection', (socket) => {
      //Client has joined a room
      socket.on('username', async () => {

        //Set environment variables
        socket.username = socket.handshake.session.username;
        socket.room = socket.handshake.session.room;

        //Add user to the room
        socket.join(socket.room);

        //Check that the user has not already been added
        if(!Object.keys(users).find(key => users[key] === socket.username)){

          //Add user to dictionary of active users
          users[socket.id] = socket.username;

          //Alert everyone in the room to the change of whos online
          io.sockets.in(socket.room).emit('online', io.sockets.adapter.rooms[socket.room].length, Object.values(users));
          io.sockets.in(socket.room).emit('joined_chat', socket.username); //Alert everyone in the room who joined the chat
        }//End if
      });

      //TODO REMOVE
      socket.on('disconnect', (username) => {
          delete users[socket.id];
          console.log("IN DISCONNETCT");
      })

      function retRoom(room){
        return room ? room.length : 0;
      }

      //Alert everyone that the current user left
      socket.on('left', () => {
        //Leave the room
        socket.leave(socket.handshake.session.room); //Disconnect current user instance from room
        delete users[socket.id]; //Remove user instance from list of active users

        //Only broadcast left message if there are no user instances left connected to room
        if(!Object.keys(users).find(key => users[key] === socket.handshake.session.username)){

          //Update all users with change to who is online
          io.sockets.in(socket.handshake.session.room).emit('online', retRoom(io.sockets.adapter.rooms[socket.handshake.session.room]), Object.values(users));

          socket.handshake.session.room = ""; //Reset current user instance room
          io.sockets.in(socket.room).emit('left_chat', socket.username); //Alert all users who left the chat
        }//Endif
      })//End function

      //Current user sent a message
      socket.on('chat_message', (message) => {
          messageTasks.saveMessage(socket.username, socket.room, message); //Save the message to database
          io.sockets.in(socket.room).emit('chat_message', {username:socket.username, msg:message}); //Send message to all users
      });

      //Current user is typing
      socket.on('typing', () => {
          io.sockets.in(socket.room).emit('typing', socket.username); //Alert other users, current user typing
      });

      //Current user stopped typing
      socket.on('stopped_typing', () => {
          io.sockets.in(socket.room).emit('stopped_typing', socket.username); //Alert all users, current user stopped typing
      });
  }); //End connection
} //End module.exports
