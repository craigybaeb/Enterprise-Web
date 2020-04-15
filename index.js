var DocumentDBClient = require('documentdb').DocumentClient;
const storage = require('azure-storage');
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=enterpriseface;AccountKey=TljXRnTsV3zc1YbD2oLvsC3co/zdLQNpwWyII65EVCSoNoOTyQ7y7wtJVJKBHgw01NnY3IcD5kbJ6U1nweYgjw==;EndpointSuffix=core.windows.net';
const express = require('express');
const app = express();
const RateLimit = require('express-rate-limit');
var cookieParser = require('cookie-parser');
var session = require('express-session')({
  secret: "Shh, its a secret!",
  httpOnly: true,
  resave: true,
  saveUninitialized: true,
  rolling : true,
  cookie: {maxAge : 5 * 60 * 1000}
  });
var sharedsession = require("express-socket.io-session");
app.use(cookieParser());
app.use(session);
app.disable('x-powered-by');
const { check, validationResult } = require('express-validator');
//var helmet = require('helmet');
//app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'"],
//     scriptSrc: ["'self'", 'https://code.jquery.com'],
//     styleSrc: ["'self'", 'https://fonts.googleapis.com'],
//     fontSrc: ['https://fonts.gstatic.com'],
//
//   }
// }))

app.enable('trust proxy'); // only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)

const createAccountLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: "Too many accounts created from this IP, please try again after an hour"
});

const dayLimiter = new RateLimit({
  windowMs: 60*60*1000*24, // 1 hour window
  max: 100, // start blocking after 5 requests
  message: "Too many accounts created from this IP, please try again after an hour"
});

app.use(dayLimiter)

app.set('/views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.urlencoded())
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.io = io;
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
var taskDaoRooms = new TaskDao(docDbClient, config.databaseId, "rooms");

taskDao.init();
taskDaoRooms.init();
taskDaoMessages.init();

app.get('/', isLoggedIn, function(req, res) {
  var querySpec = {
      query: 'SELECT * FROM c'
  };

   taskDaoRooms.find(querySpec, function (err, items) {
     console.log(items[0])
      res.render('pages/join', {rooms:items});
})



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

app.get('/delete', function(req, res) {
    res.render('pages/delete');
});

app.post('/delete', function(req, res) {
  var querySpec = {
      query: 'SELECT * FROM c WHERE c.room=@room',
      parameters: [{
          name: '@room',
          value: req.body.room
      }]
  };


      taskDaoRooms.deleteItem(querySpec, function(err, replaced){
        console.log(err)
      })


    res.send({msg:"Success"});
});
app.get('/privilege', isLoggedIn, isMaster, function(req,res){
  res.render('pages/escalate')
})
app.post('/privilege', function(req,res){
  var querySpec = {
      query: 'SELECT * FROM c WHERE c.username=@username',
      parameters: [{
          name: '@username',
          value: req.body.username
      }]
  };

  taskDao.updateItem(querySpec, req.body.priv,function (err, items) {
    res.send({msg: "Updated"});
  });
})
app.post('/register', [
  check('username').isLength({ min: 3, max: 15 }).withMessage('Username must be between 3-15 characters long!'),
  check('password').isLength({ min: 6, max: 15 }).withMessage('Password must be between 6-15 characters long!')],
    function(req,res){
      const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const username = req.body.username;
  const password = req.body.password;
  const hash = passwordHash.generate(password);
  var item = {username:username, password:hash, priv:1}

  taskDao.addItem(item, function (err) {
      if (err) {
          res.send({msg:err});
      }
      req.session.username = username;
      res.status(201).send({msg:"Register success!"});
  });
});

app.post('/addroom', function(req,res){
  const room = req.body.room;
  var item = {room:room}

  taskDaoRooms.addItem(item, function (err) {
      if (err) {
          res.send({msg:err});
      }else{
        res.status(201).send({msg:"Room added!"});
      }

  });
});

async function getRooms(){
  var querySpec = {
      query: 'SELECT * FROM c'
  };
  var ritems;
  await taskDaoRooms.find(querySpec, function (err, items) {
      ritems = items;
})
return ritems;
}

function saveMessage(sender, room, message){
  var item = {sender:sender, room:room, message:message}

  taskDaoMessages.addItem(item, function (err) {

  });
}

function isLoggedIn(req, res, next){
  if(req.session.username){
    next()
  }else{
    res.status(403).redirect("/login")
  }
}
function isMaster(req,res,next){
  if(req.session.priv == 3){
    next()
  }else{
    res.status(403).redirect("/")
  }
}

app.post('/savedMessages', function(req,res){
  var querySpec = {
      query: 'SELECT * FROM c WHERE c.room=@room',
      parameters: [{
          name: '@room',
          value: req.session.room
      }]
  };

  taskDaoMessages.find(querySpec, function (err, items) {
    res.send({username:req.session.username, messages:items});
  });


})

app.post('/chat', function(req,res){
  req.session.room = req.body.room;
  res.render('pages/main', {room:req.body.room})
})

app.get('/about', function(req,res){
  res.render('pages/about')
})

app.post('/logout', function(req,res){
  req.session.destroy();
  res.status(200).send();
})
app.post('/login', createAccountLimiter, function(req,res){
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
        req.session.username = username;
        req.session.priv = items[0].priv;
        res.send({match: true, msg:"Login success!"});
      }else{
        res.send({match: false, msg:"Password does not match the one stored for this user!"});
      }

  });
});
io.use(sharedsession(session, {
    autoSave:true
}));
const users = {};
var count = 0;
io.sockets.on('connection', function(socket) {
    socket.on('username', async function() {


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
          //io.sockets.in(room).emit('whos_online', io.sockets.clients(room))
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
        delete users[socket.id];

        console.log(count);console.log(users);


        //io.sockets.in(socket.room).emit('whos_online', io.sockets.clients(socket.room))
    })

    socket.on('left', function() {
        socket.leave(socket.handshake.session.room);
        delete users[socket.id];
        count--;
        console.log(count);console.log(users);
        io.sockets.in(socket.handshake.session.room).emit('online', count, Object.values(users));
        socket.handshake.session.room = "";
    })

    socket.on('chat_message', function(message) {
        saveMessage(socket.username, socket.room, message);

        io.sockets.in(socket.room).emit('chat_message', {username:socket.username, msg:message});

    });

});

server.listen(8080, function() {
    console.log('listening on *:8080');
});
