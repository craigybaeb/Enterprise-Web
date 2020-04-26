const DocumentDBClient = require('documentdb').DocumentClient;
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=enterpriseface;AccountKey=TljXRnTsV3zc1YbD2oLvsC3co/zdLQNpwWyII65EVCSoNoOTyQ7y7wtJVJKBHgw01NnY3IcD5kbJ6U1nweYgjw==;EndpointSuffix=core.windows.net';
const express = require('express');
const RateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { check, validationResult, body } = require('express-validator');
const bodyParser = require('body-parser');
const controller = require('./routes/controller');
const { isLoggedIn, isMaster, isAdmin } = require("./access");
const helmet = require('helmet');
const session = require('express-session')({
  secret: "Shh, its a secret!",
  httpOnly: true,
  resave: true,
  saveUninitialized: true,
  rolling : true,
  cookie: {maxAge : 10 * 60 * 1000}
  });

//Configure and load models
const config = require('./models/config');
const TaskDao = require('./models/taskDao');
const docDbClient = new DocumentDBClient(config.host, {masterKey: config.authKey});
const { main, deleteRoom, addRoom, deletePage} = require('./roomList')(TaskDao, config, docDbClient);
const { login, editPrivileges, register } = require('./userList')(TaskDao, config, docDbClient);
const { getMessages } = require('./messageList')(TaskDao, config, docDbClient);
//const urlencodedParser = bodyParser.urlencoded({ extended: false })

const loginLimiter = new RateLimit({
  windowMs: 60*60*1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: "Too many login attempts from this IP, please try again after an hour"
});

const dayLimiter = new RateLimit({
  windowMs: 60*60*1000*24, // 1 day window
  max: 1000, // start blocking after 100 requests
  message: "Request blocked as daily request limit reached."
});

const app = express();

app.use(helmet())
app.use('/room', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(session);
app.use(dayLimiter)
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.urlencoded())

app.set('view engine', 'ejs');
app.set('/views', __dirname + '/views');

app.enable('trust proxy');

//Setup socket.io
const server = require('http').Server(app);
require('./socket-io')(session, server);

//Handle 'GET' requests
app.get('/', isLoggedIn, main);
app.get('/register', (req, res) => {res.render('pages/register', {privilege: req.session.priv})}); //Register page
app.get('/login', (req, res) => {res.render('pages/login', {privilege: req.session.priv})}); //Login page
app.get('/about', (req, res) => {res.render('pages/about', {privilege: req.session.priv})}); //About page
app.get('/room/add', isLoggedIn, isAdmin, (req, res) => {res.render('pages/addroom', {privilege: req.session.priv})}); //Add room page
app.get('/room/delete', isLoggedIn, isAdmin, deletePage); //Delete room page
app.get('/privilege', isLoggedIn, isMaster, (req, res) => {res.render('pages/escalate', {privilege: req.session.priv})}) //Edit user privileges page
app.get('/room/:room/messages', isLoggedIn, getMessages);
app.get('/admin', isLoggedIn, isAdmin, (req,res) => {res.render('pages/admin', {privilege: req.session.priv})})

//Join the chosen room
app.get('/room/:room', isLoggedIn, (req, res) => {
  req.session.room = req.params.room;
  res.render('pages/main', {privilege: req.session.priv, room:req.params.room})
})

//Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).redirect('/login');
})

//Delete a room
app.delete('/room/:room', isLoggedIn, isAdmin, deleteRoom);
const val = (req,res,next) =>{
  if(req.body.username.length > 0 & req.body.username.length < 15){
    ['<','>'].forEach((char)=>{
      if(req.body.username.split("").includes(char)){
        console.log("FOUND");
      }
    })
  }
  next()
}
//Update user privileges
app.put('/privilege', isLoggedIn, isMaster, editPrivileges);

//Handle 'POST' requests
app.post('/login', loginLimiter, login); //Login
app.post('/room', isLoggedIn, isAdmin, addRoom); //Add new room
app.post('/register', val,register);


//Start the server
server.listen(8080, () => {console.log('listening on *:8080')});
