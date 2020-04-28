const taskDao = require("../models/taskDao");
console.log("LISTING")
 class RoomTasks {
   /**
    * Handles the various APIs for displaying and managing tasks
    * @param {taskDao} taskDao
    */
   constructor(taskDao) {
     this.taskDao = taskDao;
   }

   async deleteRoom(req, res) {
     const querySpec = {
       query: "SELECT * FROM root r WHERE r.room=@room",
       parameters: [
         {
           name: "@room",
           value: req.params.room
         }
       ]
     };

     const deleted = await this.taskDao.deleteItem(querySpec);
     console.log(deleted)
     res.send({msg:"Success"});
   }

   async changePrivileges(req,res){
     const querySpec = {
         query: 'SELECT * FROM c WHERE c.username=@username',
         parameters: [{
             name: '@username',
             value: req.body.username
         }]
     };

     const updated = await this.taskDao.updateUser(querySpec, req.body.priv);
     console.log(updated)
     res.send({msg:"Success"});

   }

   async addRoom(req,res){
     const added = await this.taskDao.addItem({ room : req.body.room });
     console.log(added)

     if (!added) {
         res.send({msg:"Error"});
     }else{
       res.status(201).send({msg:"Room added!"});
     }
   }

   async deletePage(req,res){
     const querySpec = {query: 'SELECT * FROM c'};

      const items = await this.taskDao.find(querySpec);
      res.render('pages/delete', {privilege: req.session.priv, rooms:items});
   }

   async joinRoom(req,res){
     const querySpec = {query: 'SELECT * FROM c'};
    const rooms = await this.taskDao.find(querySpec);

      res.render('pages/join', {privilege: req.session.priv, rooms:rooms});
   }
 }

 module.exports = RoomTasks;
