//const controller = require("./routes/controller")
const {roomConfig, messageConfig, userConfig} = require('./models/config');

const TaskDao = require('./models/taskDao');

const CosmosClient = require('@azure/cosmos').CosmosClient

const MessageTasks = require('./MessageTasks')

const cosmosClient = new CosmosClient({
 endpoint: userConfig.host,
 key: userConfig.authKey
})

const messageDao = new TaskDao(cosmosClient, messageConfig.databaseId, messageConfig.collectionId, "/room");

messageDao
 .init(err => {
   console.error(err)
 })
 .catch(err => {
   console.error(err)
   console.error(
     'Shutting down because there was an error settinig up the database.'
   )
   process.exit(1)
 })

 const messageTasks = new MessageTasks(messageDao);

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

        socket.join(socket.room);
        if(!Object.keys(users).find(key => users[key] === socket.username)){
          users[socket.id] = socket.username;


        console.log(users);
        console.log(count);
        //Send this event to everyone in the room.
        io.sockets.in(socket.room).emit('online', io.sockets.adapter.rooms[socket.room].length, Object.values(users));
        io.sockets.in(socket.room).emit('joined_chat', socket.username);
          //io.sockets.in(room).emit('whos_online', io.sockets.clients(room))
        }
    });

    socket.on('disconnect', (username) => {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
        delete users[socket.id];

        console.log(count);console.log(users);


    })
    function retRoom(room){
      return room ? room.length : 0;
    }
    socket.on('left', () => {
      console.log("IN LEFT");



        socket.leave(socket.handshake.session.room);
        delete users[socket.id];
        if(!Object.keys(users).find(key => users[key] === socket.handshake.session.username)){
        console.log(count);console.log(users);
        io.sockets.in(socket.handshake.session.room).emit('online', retRoom(io.sockets.adapter.rooms[socket.handshake.session.room]), Object.values(users));
        socket.handshake.session.room = "";
        io.sockets.in(socket.room).emit('left_chat', socket.username);
      }
    })

    socket.on('chat_message', (message) => {
        messageTasks.saveMessage(socket.username, socket.room, message);

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
