const TaskDao = require("../models/TaskDao");
const passwordHash = require('password-hash')

class UserTasks {
 /**
  * Handles the various APIs for displaying and managing tasks
  * @param {roomDao} roomDao
  */
 constructor(taskDao) {
   this.taskDao = taskDao;
 }

 async changePrivileges(req,res){
   const querySpec = {
       query: 'SELECT * FROM c WHERE c.username=@username',
       parameters: [{
           name: '@username',
           value: req.body.username
       }]
   };

   const updated = await this.taskDao.updateItem(querySpec, req.body.priv);

   if(updated){
     res.send({msg: "Updated"});
   }else{
     res.send({msg: "Update failed"});
   }
 }

 async login(req,res){
   const username = req.body.username;
   const password = req.body.password;

   const querySpec = {
       query: 'SELECT * FROM c WHERE c.username=@username',
       parameters: [{
           name: '@username',
           value: username
       }]
   };

   const user = await this.taskDao.find(querySpec);

       if(user.length){
       if(passwordHash.verify(password, user[0].password)){
         req.session.username = username;
         req.session.priv = user[0].priv;

         res.send({match: true, msg:"Login success!"});
       }else{
         res.send({match: false, msg:"Username and password don't match!"});
       }
     }else{
       res.send({match: false, msg:"Username and password don't match!"});
     }
 }

 async register(req,res){
   const username = req.body.username;
   const password = req.body.password;
   const hash = passwordHash.generate(password);
   const item = {username:username, password:hash, priv:1}

   const registered = this.taskDao.addItem(item);
   req.session.username = username;
   req.session.priv = "1";
   res.status(201).send({msg:"Register success!"});
 }

}

 module.exports = UserTasks;
