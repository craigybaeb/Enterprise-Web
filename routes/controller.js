const DocumentDBClient = require('documentdb').DocumentClient;
const config = require('../models/config');
const docDbClient = new DocumentDBClient(config.host, {
    masterKey: config.authKey
});
const TaskDao = require('../models/taskDao');
const taskDaoMessages = new TaskDao(docDbClient, config.databaseId, "messages");
taskDaoMessages.init();

module.exports = {
  getRooms: async () => {
    const querySpec = {
        query: 'SELECT * FROM c'
    };
    let ritems;
    await taskDaoRooms.find(querySpec, (err, items) => {
        ritems = items;
  })
  return ritems;
},

  saveMessage: (sender, room, message) => {
    const item = {sender:sender, room:room, message:message}

    taskDaoMessages.addItem(item, (err) => {});
  }
}
