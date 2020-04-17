const DocumentDBClient = require('documentdb').DocumentClient;
const docdbUtils = require('./docdbUtils');

function TaskDao(documentDBClient, databaseId, collectionId) {
  this.client = documentDBClient;
  this.databaseId = databaseId;
  this.collectionId = collectionId;

  this.database = null;
  this.collection = null;
}

module.exports = TaskDao;

TaskDao.prototype = {
    init: function (callback) {
        const self = this;

        docdbUtils.getOrCreateDatabase(self.client, self.databaseId, function (err, db) {
            if (err) {
                callback(err);
            } else {
                self.database = db;
                docdbUtils.getOrCreateCollection(self.client, self.database._self, self.collectionId, function (err, coll) {
                    if (err) {
                        callback(err);

                    } else {
                        self.collection = coll;
                    }
                });
            }
        });
    },

    find: function (querySpec, callback) {
        const self = this;

        self.client.queryDocuments(self.collection._self, querySpec, { enableCrossPartitionQuery: true }).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {
                callback(null, results);
            }
        });
    },

    addItem: function (item, callback) {
        const self = this;

        self.client.createDocument(self.collection._self, item, function (err, doc) {
            if (err) {
                callback(err);

            } else {
                callback(null, doc);
            }
        });
    },

    updateItem: function (querySpec, priv, callback) {
        const self = this;
        self.client.queryDocuments(self.collection._self, querySpec, { enableCrossPartitionQuery: true }).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {
              console.log("££££" + results)
                results[0].priv = priv;

                self.client.replaceDocument(results[0]._self, results[0], function (err, replaced) {
                    if (err) {
                        callback(err);

                    } else {
                        callback(null, replaced);
                    }
                });
            }
        });
    },

    getItem: function (itemId, callback) {
        const self = this;

        const querySpec = {
            query: 'SELECT * FROM root r WHERE r.id = @id',
            parameters: [{
                name: '@id',
                value: itemId
            }]
        };

        self.client.queryDocuments(self.collection._self, querySpec).toArray(function (err, results) {
            if (err) {
                callback(err);

            } else {
                callback(null, results[0]);
            }
        });
    },

    deleteItem: function(querySpec, callback) {
      const self = this;
self.client.queryDocuments(self.collection._self, querySpec).toArray(function (err, results) {
          if (err) {
              callback(err);

          } else {
            console.log(results)
            docLink = 'dbs/' + self.databaseId + '/colls/' + self.collectionId + '/docs/' + results[0].id;
            console.log(docLink)
              self.client.deleteDocument(docLink, function (err, replaced) {
                  if (err) {
                      callback(err);

                  } else {
                      callback(null, replaced);
                  }
              });
          }
      });
}
};
