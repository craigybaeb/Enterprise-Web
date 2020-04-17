const DocumentDBClient = require('documentdb').DocumentClient;
const connectionString = 'DefaultEndpointsProtocol=https;AccountName=enterpriseface;AccountKey=TljXRnTsV3zc1YbD2oLvsC3co/zdLQNpwWyII65EVCSoNoOTyQ7y7wtJVJKBHgw01NnY3IcD5kbJ6U1nweYgjw==;EndpointSuffix=core.windows.net';
const config = require('./config');
const TaskList = require('./routes/tasklist');
const TaskDao = require('./models/taskDao');
