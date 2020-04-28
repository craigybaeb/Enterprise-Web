const TaskDao = require("./models/TaskDao");
console.log("LISTING")
 class MessageTasks {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {roomDao} roomDao
    */
   constructor(taskDao) {
     this.taskDao = taskDao;
   }

   async getMessages(req,res){
     const querySpec = {
         query: 'SELECT * FROM c WHERE c.room=@room',
         parameters: [{
             name: '@room',
             value: req.session.room
         }]
     };

     const messages = await this.taskDao.find(querySpec);

     res.send({username:req.session.username, messages:messages});
   }

   async saveMessage(sender, room, message){
     const item = {sender:sender, room:room, message:message}

     this.taskDao.addItem(item);
   }

 }

 module.exports = MessageTasks;
