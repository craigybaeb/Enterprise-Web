/* This is the server file for the LectureChat application */

//Import the modules
const express = require('express');
const RateLimit = require('express-rate-limit');
const validate = require("./controllers/validate");
const { isLoggedIn, isMaster, isAdmin } = require("./controllers/access");
const {roomTasks, messageTasks, userTasks} = require("./controllers/loadModels");
const helmet = require('helmet');

//Configures sessions for the server
const cookieParser = require('cookie-parser');
const session = require('express-session')({
  secret: "I want an A! [Please] :)",
  httpOnly: true,
  resave: true,
  saveUninitialized: true,
  rolling : true,
  cookie: {maxAge : 10 * 60 * 1000} //Terminate the user session after 10 minutes of inactivity
  })

//Prevents brute force attacks on login
const loginLimiter = new RateLimit({
  windowMs: 60*60*1000, //1 hour window
  max: 5, // Start blocking after 5 requests
  message: "Too many login attempts from this IP, please try again after an hour"
});

//Prevents Denial of Service attacks on all routes
const dayLimiter = new RateLimit({
  windowMs: 60*60*1000*24, //1 day window
  max: 1000, //Start blocking after 100 requests
  message: "Request blocked as daily request limit reached."
});

//Create express instance
const app = express();

//Configure the view engine
app.set('view engine', 'ejs'); //We are using EJS
app.set('/views', __dirname + '/views'); //View reside in '/views' directory

//Add the following to middlware stack for all routes in the app
app.use(helmet()) //Sets security headers
app.use('/admin', express.static(__dirname + '/public')); //Prevents GET request conflicts when fetching static files on '/admin' routes
app.use('/room', express.static(__dirname + '/public')); //Prevents GET request conflicts when fetching static files on '/room' routes
app.use('/admin/room', express.static(__dirname + '/public')); //Prevents GET request conflicts when fetching static files on '/admin/room' routes
app.use(express.static(__dirname + '/public')); //Tells the app to look in the '/public' folder for our static files
app.use(cookieParser()); //Needed to work with express-session
app.use(session); //Enable sessions across the app
app.use(dayLimiter); //Apply the DoS protection
//app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded()) //TODO

//Enable 'trust proxy' to work with load balancers
app.enable('trust proxy');

//Setup socket.io
const server = require('http').Server(app);
require('./controllers/socket-io')(session, server);

//Handle 'GET' requests
app.get('/', isLoggedIn, (req,res) => roomTasks.getRooms(req,res));
app.get('/register', (req, res) => {res.render('pages/basic/register', {privilege: req.session.priv})}); //Register page
app.get('/login', (req, res) => {res.render('pages/basic/login', {privilege: req.session.priv})}); //Login page
app.get('/about', (req, res) => {res.render('pages/basic/about', {privilege: req.session.priv})}); //About page
app.get('/room/:room/messages', isLoggedIn, (req,res,next) => messageTasks.getMessages(req,res)); //Get saved messages for a room
app.get('/room/:room', isLoggedIn, (req, res) => roomTasks.joinRoom(req,res)); //Join the chosen room

//Admin pages
app.get('/admin', isLoggedIn, isAdmin, (req,res) => {res.render('pages/admin/admin', {privilege: req.session.priv})}); //Get the admin page
app.get('/admin/room/add', isLoggedIn, isAdmin, (req, res) => {res.render('pages/admin/addroom', {privilege: req.session.priv})}); //Add room page
app.get('/admin/room/delete', isLoggedIn, isAdmin, (req, res) => roomTasks.deletePage(req,res)); //Delete room page
app.get('/admin/privileges', isLoggedIn, isMaster, (req, res) => {res.render('pages/admin/privileges', {privilege: req.session.priv})}) //Edit user privileges page

//Logout
app.get('/logout', (req, res) => {
  req.session.destroy(); //Kill the session
  res.status(200).redirect('/login');
})

//Delete a room
app.delete('/room/:room', isLoggedIn, isAdmin, (req, res, next) => roomTasks.deleteRoom(req,res));

//Update user privileges
app.put('/user/:username', isLoggedIn, isMaster, validate.privileges, (req, res, next) => userTasks.changePrivileges(req,res));

//Handle 'POST' requests
app.post('/login', loginLimiter, (req, res, next) => userTasks.login(req,res)); //Login
app.post('/room', isLoggedIn, isAdmin, validate.room, (req, res, next) => roomTasks.addRoom(req,res)); //Add new room
app.post('/user', validate.register, (req, res, next) => userTasks.register(req,res)); //Register account


//404 Not Found
app.get('*', (req, res) => { res.status(404).redirect('/')});

//Start the server
server.listen(8080, () => {console.log('listening on *:8080')}); //Browse to 'localhost:8080' in browser to view page once run using "npm start"
