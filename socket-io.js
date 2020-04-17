const controller = require("./routes/controller")
module.exports=  (session, server) => {


const io = require('socket.io')(server);
const sharedsession = require("express-socket.io-session");
io.use(sharedsession(session, {
    autoSave:true
}));
const users = {};
let count = 0;
io.sockets.on('connection', (socket) => {
    socket.on('username', async () => {

        socket.username = socket.handshake.session.username;
        socket.room = socket.handshake.session.room;
        console.log("ROOM" + socket.room)
        socket.join(socket.room);
        users[socket.id] = socket.username;
        count++;
        console.log(users);
        console.log(count);
        //Send this event to everyone in the room.
        io.sockets.in(socket.room).emit('online', count, Object.values(users));
        io.sockets.in(socket.room).emit('joined_chat', socket.username);
          //io.sockets.in(room).emit('whos_online', io.sockets.clients(room))
    });

    socket.on('disconnect', (username) => {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
        delete users[socket.id];

        console.log(count);console.log(users);


        //io.sockets.in(socket.room).emit('whos_online', io.sockets.clients(socket.room))
    })

    socket.on('left', () => {
      console.log("IN LEFT");
        socket.leave(socket.handshake.session.room);
        delete users[socket.id];
        count--;
        console.log(count);console.log(users);
        io.sockets.in(socket.handshake.session.room).emit('online', count, Object.values(users));
        socket.handshake.session.room = "";
        io.sockets.in(socket.room).emit('left_chat', socket.username);
    })

    socket.on('chat_message', (message) => {
        controller.saveMessage(socket.username, socket.room, message);

        io.sockets.in(socket.room).emit('chat_message', {username:socket.username, msg:message});

    });

    socket.on('typing', () => {
      console.log("in typing")
        io.sockets.in(socket.room).emit('typing', socket.username);

    });

    socket.on('stopped_typing', () => {
        console.log("in stopped")
        io.sockets.in(socket.room).emit('stopped_typing', socket.username);

    });

});
}
