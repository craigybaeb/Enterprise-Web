/* This module handles the tasks involving the user account for the server */

//Import modules
const TaskDao = require("../models/TaskDao"); //DAO is used to communicate with the database
const passwordHash = require('password-hash'); //Used to encrypt passwords at rest, for storing in the database

class UserTasks {
 /**
  * Handles the various APIs for creating, accessing and altering user accounts
  * @param {taskDao} taskDao
  */
 constructor(taskDao) {
   this.taskDao = taskDao;
 }

 //Edit user access privileges
 async changePrivileges(req,res){

   //Build SQL query for communicating with the database
   const querySpec = {
       query: 'SELECT * FROM c WHERE c.username=@username', //Get all items from the 'Users' container in the database where "Username" matches the one provided (Should only be one)
       parameters: [{
           name: '@username', //Parameterisation prevents SQLi
           value: req.params.username //Username specified by the client
       }]
   };

   //Attempt the update of the user privileges
   try{
     //Use the model to update the users privileges
     const updated = await this.taskDao.updateItem(querySpec, req.body.priv);

     //Check if update was success
     if(updated){ //Success
       res.status(200).send({msg: `Admin privileges for ${req.params.username} updated!`});
     }else{ //User is not found
       res.status(404).send({msg: ["User not found! Please try again."]});
     }
   }catch{
     //Update failed due to server error
     res.status(500).send({msg: ["Uh oh! An unexpected server error has occured."]});
   }//End try/catch
 }//End changePrivileges()

 //Log into user account
 async login(req,res){

   //Get username and passwords from client request
   const username = req.body.username;
   const password = req.body.password;

   //Build the SQL query to feth the user credentials from the database
   const querySpec = {
       query: 'SELECT * FROM c WHERE c.username=@username', //Get the item from the 'Login' container in the database where the 'Username' matches the one given
       parameters: [{
           name: '@username', //Parameterisation prevents SQLi
           value: username //Username supplied by client
       }]
   };

   //Attempt to log the user in
   try{
     //Use the model to communicate with the database
     const [ user ] = await this.taskDao.find(querySpec);

     //Check if an account with the given username exists
     if(user){ //Exists

       //Check if the passwords match
       if(passwordHash.verify(password, user.password)){ //Passwords match

         //Set the session variables
         req.session.username = username; //Current user
         req.session.priv = user.priv; //Level of administrative control

         //Send success message
         res.status(200).send({msg:`Welcome back ${username}!`});

       }else{ //Passwords do not match
         //Send error message
         res.status(401).send({msg:"Username and password don't match!"});
       }
     }else{ //Account with this username not found
       //Send error message
       res.status(404).send({msg:"Username and password don't match!"});
     }
   }catch{ //Server failed
     //Send error message
     res.status(500).send({msg:"Uh oh! An unexpected server error has occured."});
   }//End try/catch
 }//End login()

 //Register new user account
 async register(req,res){

   //Get username and password from client request
   const username = req.body.username;
   const password = req.body.password;

   //Generate a hash of the password in order to encrypt it before storage
   const hash = passwordHash.generate(password);

   //Build an item for database storage using the username and password
   //Defaulting to no admin privileges (priv:1)
   const item = {username:username, password:hash, priv:1}

   //Build the SQL query to check if the user exists before attempting to register
   const querySpec = {
       query: 'SELECT * FROM c WHERE c.username=@username', //Get the item from the 'Login' container in the database where the 'Username' matches the one given
       parameters: [{
           name: '@username', //Parameterisation prevents SQLi
           value: username //Username supplied by client
       }]
   };

   //Attempt to register user
   try{
     //Register user if they do not exist
     const registered = await this.taskDao.addItemIfNotExists(querySpec, item);

     //Check if the user already exists
     if(registered){ //User registered

       //Set the session variables
       req.session.username = username; //Sets the username
       req.session.priv = "1"; //Sets the user to have no admin privileges by default

       //Send success message
       res.status(201).send({msg:"Register success!"});

     }else{ //User already exists
       //Send error message
       res.status(409).send({msg:["Sorry, an account with this username already exists! Please choose another username and try again."]});
     }

   }catch{ //Server failed
     //Send error message
     res.status(500).send({msg:["Uh oh! An unexpected server error has occured."]});
   }//End try/catch
 }//End register()

}//End UserTasks

 module.exports = UserTasks; //Export UserTasks for use by the server
