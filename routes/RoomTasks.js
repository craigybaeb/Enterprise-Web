/* This module handles the tasks involving the management of rooms for the server */

//Import the modules
const taskDao = require("../models/taskDao");

class RoomTasks {
 /**
  * Handles the various APIs for managing rooms
  * @param {taskDao} taskDao
  */
 constructor(taskDao) {
   this.taskDao = taskDao;
 }

 //Delete a room from the database
 async deleteRoom(req, res) {

   //Build SQL query for the DAO
   const querySpec = {
     query: "SELECT * FROM root r WHERE r.room=@room", //Will get the item to delete from the 'Rooms' container
     parameters: [
       {
         name: "@room", //Parameterisation prevents SQLi
         value: req.params.room //Get the room to delete from the client request
       }
     ]
   };

   //Attempt to delete the room
   try{
     const deleted = await this.taskDao.deleteItem(querySpec); //Delete the room

     //Check if room was deleted succesfully
     if(deleted){ //Delete success
       //Send success message
       res.status(200).send({msg:`Successfully deleted ${req.params.room}!`});
     }else{ //Failed to delete
       //Send error message
       res.status(404).send({msg:["Uh oh! A room with this name was not found or does not exist. Please try again."]});
     }

   }catch(err){ //Server failed
     //Send error message
     console.log(err)
     res.status(500).send({msg:["Uh oh! An unexpected server error has occured."]});
   } //End try/catch

 } //End deleteRoom()

 //Add a room to the database
 async addRoom(req,res){

   //Build the SQL query to check if the room exists before attempting to create
   const querySpec = {
       query: 'SELECT * FROM c WHERE c.room=@room', //Get the item from the 'Rooms' container in the database where the 'Room' matches the one given
       parameters: [{
           name: '@room', //Parameterisation prevents SQLi
           value: req.params.room //Room name supplied by client
       }]
   };

   //Construct an item from the given room
   const item = { room : req.body.room }

   //Attempt to create a room
   try{
     const added = await this.taskDao.addItemIfNotExists(querySpec, item); //Add room to database using DAO

     //Check if room was added successfully
     if (added) { //Succesfully created room
       //Send success message
       res.status(201).send({msg:`${req.body.room} added to rooms!`});
     }else{ //Room with name already existed
       //Send error message
       res.status(409).send({msg:"Sorry, a room with this name already exists! Please choose another name and try again."});
     }

   }catch(err){ //Server failed
     //Send error message
     console.log(err)
     res.status(500).send({msg:"Uh oh! An unexpected server error has occured."});
   } // End try/catch
 } //End addRoom()

 //Get list of rooms for 'Delete' page
 async deletePage(req,res){

   //Attempt to get rooms
   try{
     const querySpec = {query: 'SELECT * FROM c'}; //Build an SQL query for the DAO
     const items = await this.taskDao.find(querySpec); //Fetch the rooms from the database using the model

     //Send the rooms to the client and render the 'Delete' page
     res.render('pages/admin/delete', {privilege: req.session.priv, rooms:items});

   }catch{ //Server failed
     //Send error message
     res.status(500).send({msg:"Uh oh! An unexpected server error has occured."});
   } // End try/catch
 } //End deletePage()

 //Get list of rooms for 'Join Room' page
 async getRooms(req,res){

   //Attempt to get rooms
   try{
     const querySpec = {query: 'SELECT * FROM c'}; //Build an SQL query for the DAO
     const rooms = await this.taskDao.find(querySpec); //Fetch the rooms from the database using the model

     //Send the rooms to the client and render the 'Join Room' page
     res.render('pages/basic/join', {privilege: req.session.priv, rooms:rooms});

   }catch{ //Server failed
     //Send error message
     res.status(500).send({msg:"Uh oh! An unexpected server error has occured."});
   } // End try/catch
 } //End joinRoom()

 async joinRoom(req,res){
   //Attempt to get rooms
   try{

     //Build SQL query for the DAO
     const querySpec = {
       query: "SELECT * FROM root r WHERE r.room=@room", //Will check to see if the room exists in the "Room" container
       parameters: [
         {
           name: "@room", //Parameterisation prevents SQLi
           value: req.params.room //Get the room to join from the client request
         }
       ]
     };

     const rooms = await this.taskDao.find(querySpec); //Fetch the room from the database using the model

     //Check if the room exists
     if(rooms.length){ //Room exists
       req.session.room = req.params.room; //Set room in session
       res.render('pages/basic/main', {privilege: req.session.priv, room:req.params.room}); //Take the user to the room

     }else{ //Room does not exist
       res.status(404).send({msg:"Uh oh! The requested room was not found. Please try again."}); //Display error
     }


   }catch{ //Server failed
     //Send error message
     res.status(500).send({msg:"Uh oh! An unexpected server error has occured."});
   } // End try/catch
 }
} //End RoomTasks

 module.exports = RoomTasks; //Export RoomTasks for use by the server
