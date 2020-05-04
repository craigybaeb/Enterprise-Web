/** This module handles the validation tasks for the server **/

//Import the modules
const validator = require('validator');

//Validate register form
const validateRegister = (req,res,next) =>{
  //Initialise the variables;
  let msg = []; //Will store our error messages
  const blacklist = ["<",">","/",'\\',"|","@","(",")",":",";","!","?"]; //List of illegal characters
  const username = req.body.username; //Get the username from the client
  const blacklisted = validator.blacklist(username, blacklist); //Filter illegal characters from username

  //Check if the username contains any illegal characters
  if(blacklisted !== username){
    msg.push("Username invalid, cannot contain the following characters: <,>,/,\\,|,(,),:,;,!,?.");
  }

  //Check if the password is correct length
  if(!validator.isLength(req.body.password, {min: 6, max:15})){
    msg.push("Password is incorrect length! Please enter a password between 6-15 characters long and try again.");
  }

  //Check if the username is correct length
  if(!validator.isLength(username, {min: 4, max:10})){
    msg.push("Username is incorrect length! Please enter a username between 4-10 characters long and try again.");
  }

  //Check if the passwords match
  if(!validator.equals(req.body.confirm, req.body.password)){
    msg.push("Passwords do not match! Please try again!");
  }

  //Check if the form passed validation
  msg.length ? res.status(400).send({msg:msg}) : next();
}

//Validate add room form
const validateRoom = (req,res,next) =>{
  //Initialise the variables;
  let msg = []; //Will store our error messages
  const blacklist = ["<",">","/",'\\',"|","@","(",")",":",";","!","?"]; //List of illegal characters
  const room = req.body.room; //Get the room from the client
  const blacklisted = validator.blacklist(room, blacklist); //Filter illegal characters from room

  //Check if the room contains any illegal characters
  if(blacklisted !== room){
    msg.push("Room name invalid, cannot contain the following characters: < > / \\ | ( ) : ; ! ? ");
  }

  //Check if the room name is correct length
  if(!validator.isLength(room, {min: 4, max:15})){
    msg.push("Room name is incorrect length! Please enter a name between 4-15 characters long and try again.");
  }

  //Check if the form passed validation
  msg.length ? res.status(400).send({msg:msg}) : next();
}

//Validate edit privileges route
const validatePrivileges = (req,res,next) =>{
  //Initialise the variables;
  let msg = []; //Will store our error messages
  const privilege = req.body.priv; //Get the privilege setting from the client

  //Check if the privilege is numeric
  if(!validator.isNumeric(privilege, {no_symbols: true})){
    msg.push("Privilege data has been malformed! Please select a privilege from the box and try again!");
  }

  //Check if the privilege is numeric
  if(privilege != 1 && privilege != 2 && privilege != 3){
    msg.push("Privilege setting out of bounds! Please select a setting 1-3 from the box and try again!");
  }

  //Check if the form passed validation
  msg.length ? res.status(400).send({msg:msg}) : next();
}

module.exports = {  register : validateRegister,
                    room : validateRoom,
                    privileges : validatePrivileges  };
