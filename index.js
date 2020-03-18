var DocumentDBClient = require('documentdb').DocumentClient;
const storage = require('azure-storage');
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=enterpriseface;AccountKey=TljXRnTsV3zc1YbD2oLvsC3co/zdLQNpwWyII65EVCSoNoOTyQ7y7wtJVJKBHgw01NnY3IcD5kbJ6U1nweYgjw==;EndpointSuffix=core.windows.net';
const express = require('express');
const app = express();
app.set('/views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}))

const server = require('http').Server(app);
const io = require('socket.io')(server);
const passwordHash = require('password-hash')
var config = require('./config');
var TaskList = require('./routes/tasklist');
var TaskDao = require('./models/taskDao');

var urlencodedParser = bodyParser.urlencoded({ extended: false })
//Todo App:
var docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});
var taskDao = new TaskDao(docDbClient, config.databaseId, config.collectionId);
var taskDaoMessages = new TaskDao(docDbClient, config.databaseId, "messages");
var taskList = new TaskList(taskDao);
var taskListMessages = new TaskList(taskDaoMessages);

taskDao.init();

taskDaoMessages.init();

app.get('/', function(req, res) {

    res.render('pages/index');

});
// index page
app.get('/register', function(req, res) {
    res.render('pages/register');
});

app.get('/login', function(req, res) {
    res.render('pages/login');
});
app.get('/addroom', function(req, res) {
    res.render('pages/addroom');
});
app.post('/register', function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);
  const hash = passwordHash.generate(password);
  var item = {username:username, password:hash}

  taskDao.addItem(item, function (err) {
      if (err) {
          res.send({msg:err});
      }
      res.status(201).send({msg:"Register success!"});
  });
});

app.post('/addroom', function(req,res){
  const room = req.body.room;
  var item = {room:room}

  taskDaoRooms.addItem(item, function (err) {
      if (err) {
          res.send({msg:err});
      }
      res.status(201).send({msg:"Room added!"});
  });
});

function saveMessage(sender, room, message){
  var item = {sender:sender, room:room, message:message}

  taskDaoMessages.addItem(item, function (err) {

  });
}

app.post('/savedMessages', function(req,res){
  var querySpec = {
      query: 'SELECT * FROM c WHERE c.room=@room',
      parameters: [{
          name: '@room',
          value: req.body.room
      }]
  };

  taskDaoMessages.find(querySpec, function (err, items) {
    res.send(items);
  });


})
app.post('/login', function(req,res){
  const username = req.body.username;
  const password = req.body.password;
  var querySpec = {
      query: 'SELECT * FROM c WHERE c.username=@username',
      parameters: [{
          name: '@username',
          value: username
      }]
  };

  taskDao.find(querySpec, function (err, items) {
      if (err) {
          res.send({msg:err});
      }

      if(passwordHash.verify(password, items[0].password)){
        res.send({match: true, msg:"Login success!"});
      }else{
        res.send({match: false, msg:"Password does not match the one stored for this user!"});
      }

  });
});

io.sockets.on('connection', function(socket) {
    socket.on('username', async function(username, room) {
        socket.username = username;
        socket.room = room;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
        socket.join(room);
        console.log(room, username);
        //Send this event to everyone in the room.
        io.sockets.in(room).emit('joined_room', socket.username + " joined " + room);
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        saveMessage(socket.username, socket.room, message);
        io.sockets.in(socket.room).emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);

    });

});

server.listen(8080, function() {
    console.log('listening on *:8080');
});
