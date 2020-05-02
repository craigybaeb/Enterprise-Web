/* This module handles the tasks involving the storing and fetching of messages for the server */

//Import modules
const TaskDao = require("../models/TaskDao"); //DAO is used to communicate with the database

class MessageTasks {
 /**
  * Handles the APIs for getting and saving messages
  * @param {taskDao} taskDao
  */
 constructor(taskDao) {
   this.taskDao = taskDao;
 }

 //Get the messages from the database
 async getMessages(req,res){

   //Build the SQL query for the DAO
   const querySpec = {
       query: 'SELECT * FROM c WHERE c.room=@room', //Get all from 'Rooms' container where 'Room' is current room
       parameters: [{
           name: '@room', //Parameterisation prevents SQLi
           value: req.session.room //Current room the user is in
       }]
   };

   //Attempt to get messages from database
   try{

     //Use model to recieve messages from database
     const messages = await this.taskDao.find(querySpec);

     //Check if there are messages saved for this room
     if(messages.length==0){ //No messages are saved for this room

       //Build a default message to send back to client
       const noMessages = { sender : "Craig from LectureChat",
                            message: "There are no messages in this room yet. Why not add one?"
                          }

       //Send the message
       res.status(200).send({username:req.session.username, messages: [noMessages]});

      }else{ //Messages are saved for this room
         //Send success message with messages
         res.status(200).send({username:req.session.username, messages:messages});
       }

  }catch{ //Server failed
    //Send error message
    res.status(500).send({msg:"Uh oh! An unexpected server error has occured."});
  }//End try/catch
}//End getMessages()

 //Save sent message to database
 async saveMessage(sender, room, message){

   //Attempt to save message
   try{
     const item = {sender:sender, room:room, message:message} //Build item object to save
     this.taskDao.addItem(item); //Call DAO function to add item to database
   }catch(error){
     //Something went wrong, log the error
     console.log(error)
   }//End try
 }//End saveMessage()

} //End of class

module.exports = MessageTasks; //Exports class for controller use
