/* This module loads the models for the server */

//Configure and load models
const {roomConfig, messageConfig, userConfig} = require('../models/config'); //Configurations to handle connection to Azure CosmosDB
const TaskDao = require('../models/taskDao'); //The model
const CosmosClient = require('@azure/cosmos').CosmosClient

//Controller modules
const RoomTasks = require('./RoomTasks')
const UserTasks = require('./UserTasks')
const MessageTasks = require('./MessageTasks')

//Connect to Azure CosmosDB:
const cosmosClient = new CosmosClient({
 endpoint: userConfig.host, //Can use any of the config objects for host
 key: userConfig.authKey //Can use any of the config objects for authKey
})

//Create new Database Access Objects to communicate with the database
const roomDao = new TaskDao(cosmosClient, roomConfig.databaseId, roomConfig.collectionId, "/room");
const messageDao = new TaskDao(cosmosClient, messageConfig.databaseId, messageConfig.collectionId, "/room");
const userDao = new TaskDao(cosmosClient, userConfig.databaseId, userConfig.collectionId, "/username");

//Initialise the DAOs
//Initialise roomDao
roomDao
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

//Initialise messageDao
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

//Initialise userDao
userDao
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

//Instantiate new controller objects
const roomTasks = new RoomTasks(roomDao);
const messageTasks = new MessageTasks(messageDao);
const userTasks = new UserTasks(userDao);

//Export the controllers for use by the server
module.exports = { roomTasks : roomTasks,
                   messageTasks : messageTasks,
                   userTasks : userTasks
                  }
