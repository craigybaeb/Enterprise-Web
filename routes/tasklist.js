var DocumentDBClient = require('documentdb').DocumentClient;
var async = require('async');
const passwordHash = require('password-hash');
const formidable = require('formidable');
const storage = require('azure-storage');
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=enterpriseface;AccountKey=TljXRnTsV3zc1YbD2oLvsC3co/zdLQNpwWyII65EVCSoNoOTyQ7y7wtJVJKBHgw01NnY3IcD5kbJ6U1nweYgjw==;EndpointSuffix=core.windows.net';
const blobService = storage.createBlobService(connectionString); //This allows us to perform operations on our blob storage account
const getStream = require('into-stream');
function TaskList(taskDao) {
  this.taskDao = taskDao;
}

module.exports = TaskList;
TaskList.prototype = {
    login: function (req, res) {
        var self = this;
        const username = req.body.username;
        const password = req.body.password;
        var querySpec = {
            query: 'SELECT * FROM c WHERE c.username=@username',
            parameters: [{
                name: '@username',
                value: username
            }]
        };

        self.taskDao.find(querySpec, function (err, items) {
            if (err) {
                res.send({msg:err});
            }

            if(passwordHash.verify(password, items[0].password)){
              res.send({msg:"Login success!"});
            }else{
              res.send({msg:"Password does not match the one stored for this user!"});
            }

        });
    },

    addTask: function (req, res) {
        var self = this;
        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
          const username = fields.username;
          const password = fields.password;
          const hash = passwordHash.generate(password);
          var item = {username:username, password:hash}

          const filepath = files.file.path;
          await upload(filepath,username);
          self.taskDao.addItem(item, function (err) {
              if (err) {
                  res.send({msg:err});
              }
              res.status(201).send({msg:"Register success!"});
          });
        });

    },

    add: function (req, res) {
        var self = this;
        const form = new formidable.IncomingForm();
        form.parse(req, async function (err, fields, files) {
          const username = fields.username;
          const password = fields.password;
          const hash = passwordHash.generate(password);
          var item = {username:username, password:hash}

          const file = fields.file;

          await upload2(file,username);
          self.taskDao.addItem(item, function (err) {
              if (err) {
                  res.send({msg:err});
              }
              res.status(201).send({msg:"Register success!"});
          });
        });
      }
      ,

      test: function (req, res) {
          var self = this;
          const form = new formidable.IncomingForm();
          form.parse(req, async function (err, fields, files) {
            const username = fields.username;
            const password = fields.password;
            const hash = passwordHash.generate(password);
            var item = {username:username, password:hash}

            const file = files.webcam;

            await upload(file.path, username);
            self.taskDao.addItem(item, function (err) {
                if (err) {
                    res.send({msg:err});
                }
                res.status(201).send({msg:"Register success!"});
            });

          });
        },
        
};

//This function uploads a file to our Azure Blob Storage account
const upload = async (filepath, username) => {

    //Calling the Azure 'createBlockBlobFromLocalFile' API to upload our file
    await blobService.createBlockBlobFromLocalFile('faces', username + ".jpg", filepath, function(){})//End of 'createBlobBlobFromLocalFile()' API

    return
}

//This function uploads a file to our Azure Blob Storage account
const upload2 = async (file, username) => {

// Initialize with the string

  var buffer = Buffer.from(file, 'base64');

  const stream = getStream(file);

    //Calling the Azure 'createBlockBlobFromLocalFile' API to upload our file
    await blobService.createBlockBlobFromStream('faces', username + ".jpg", stream, buffer.byteLength, function(){})//End of 'createBlobBlobFromLocalFile()' API

    return
}
