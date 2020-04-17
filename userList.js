const passwordHash = require('password-hash')

module.exports= (TaskDao, config, docDbClient) => {
  const taskDao = new TaskDao(docDbClient, config.databaseId, config.collectionId);
  taskDao.init();
  return {
  editPrivileges: (req, res) => {
    const querySpec = {
        query: 'SELECT * FROM c WHERE c.username=@username',
        parameters: [{
            name: '@username',
            value: req.body.username
        }]
    };

    taskDao.updateItem(querySpec, req.body.priv,(err, items) =>{
      res.send({msg: "Updated"});
    });
  },
  login: (req,res) =>{
    const username = req.body.username;
    const password = req.body.password;
    const querySpec = {
        query: 'SELECT * FROM c WHERE c.username=@username',
        parameters: [{
            name: '@username',
            value: username
        }]
    };

    taskDao.find(querySpec, (err, items) => {
        if (err) {
            res.send({msg:err});
        }

        if(passwordHash.verify(password, items[0].password)){
          req.session.username = username;
          req.session.priv = items[0].priv;

          res.send({match: true, msg:"Login success!"});
        }else{
          res.send({match: false, msg:"Password does not match the one stored for this user!"});
        }

    });
  },
  register : (req,res) =>{
    //const errors = validationResult(req);
// if (!errors.isEmpty()) {
//   return res.status(422).json({ errors: errors.array() });
// }
const username = req.body.username;
const password = req.body.password;
const hash = passwordHash.generate(password);
const item = {username:username, password:hash, priv:1}

taskDao.addItem(item, (err) => {
    if (err) {
        res.send({msg:err});
    }
    req.session.username = username;
    req.session.priv = "1";
    console.log(req.session.priv)
    res.status(201).send({msg:"Register success!"});
});
}
}
}
