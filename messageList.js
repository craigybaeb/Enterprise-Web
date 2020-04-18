module.exports= (TaskDao, config, docDbClient) =>{
  const taskDaoMessages = new TaskDao(docDbClient, config.databaseId, "messages");
  taskDaoMessages.init();

  return {
  getMessages: (req, res) => {
    const querySpec = {
        query: 'SELECT * FROM c WHERE c.room=@room',
        parameters: [{
            name: '@room',
            value: req.session.room
        }]
    };


    taskDaoMessages.find(querySpec, (err, items) => {
      for(i=0; i < items.length; i++){
        console.log(items[i].message)
        items[i].message = escape(items[i].message);
        console.log(items[i].message)
      }
      res.send({username:req.session.username, messages:items});
    });


  },

  saveMessage: (sender, room, message) => {
    const item = {sender:sender, room:room, message:message}

    taskDaoMessages.addItem(item, (err) => {});
  }
}
}
