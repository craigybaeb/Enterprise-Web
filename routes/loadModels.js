//Configure and load models
const {roomConfig, messageConfig, userConfig} = require('../models/config');
const TaskDao = require('../models/taskDao');
const CosmosClient = require('@azure/cosmos').CosmosClient
const RoomTasks = require('./RoomTasks')
const UserTasks = require('./UserTasks')
const MessageTasks = require('./MessageTasks')

//Todo App:
const cosmosClient = new CosmosClient({
 endpoint: userConfig.host,
 key: userConfig.authKey
})

const roomDao = new TaskDao(cosmosClient, roomConfig.databaseId, roomConfig.collectionId, "/room");
const messageDao = new TaskDao(cosmosClient, messageConfig.databaseId, messageConfig.collectionId, "/room");
const userDao = new TaskDao(cosmosClient, userConfig.databaseId, userConfig.collectionId, "/username");

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

 const roomTasks = new RoomTasks(roomDao);
 const messageTasks = new MessageTasks(messageDao);
 const userTasks = new UserTasks(userDao);

module.exports = { roomTasks : roomTasks,
                   messageTasks : messageTasks,
                   userTasks : userTasks
}
