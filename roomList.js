module.exports = (TaskDao, config, docDbClient) =>{
  const taskDaoRooms = new TaskDao(docDbClient, config.databaseId, "rooms");
  taskDaoRooms.init();

return {
main: (req,res) =>{
  const querySpec = {query: 'SELECT * FROM c'};
  console.log(req.session.priv)
   taskDaoRooms.find(querySpec, (err, items) =>{
     res.render('pages/join', {privilege: req.session.priv, rooms:items});
  })
},
deletePage: (req,res) =>{
  const querySpec = {query: 'SELECT * FROM c'};

   taskDaoRooms.find(querySpec, (err, items) =>{
     res.render('pages/delete', {privilege: req.session.priv, rooms:items});
  })
},

deleteRoom: (req, res) => {
  const querySpec = {
      query: 'SELECT * FROM c WHERE c.room=@room',
      parameters: [{
          name: '@room',
          value: req.params.room
      }]
  };


      taskDaoRooms.deleteItem(querySpec, (err, replaced) => {
        console.log(err)
      })


    res.send({msg:"Success"});
},
addRoom: (req, res) => {
  const room = req.body.room;
  const item = {room:room}

  taskDaoRooms.addItem(item, (err) => {
      if (err) {
          res.send({msg:err});
      }else{
        res.status(201).send({msg:"Room added!"});
      }

  });
}
}
}
