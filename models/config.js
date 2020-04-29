/* This module defines the configuration of the database
It is required to enable the models to connect to Azure CosmosDB */

//Configuration of 'rooms' table
const roomConfig = { host : "https://facedetails.documents.azure.com:443/",
               authKey : "PzY25OijUuCcY61YzKzDZz3AN3wP1mNINCDEAecqyQMN6kT4xDDz6UUksgME2jKrzVj9iM2Q7EPRrNkzbxvSDg==",
               databaseId : "Login",
               collectionId : "rooms"
             }

//Configuration of 'messages' table
const messageConfig = { host : "https://facedetails.documents.azure.com:443/",
              authKey : "PzY25OijUuCcY61YzKzDZz3AN3wP1mNINCDEAecqyQMN6kT4xDDz6UUksgME2jKrzVj9iM2Q7EPRrNkzbxvSDg==",
              databaseId : "Login",
              collectionId : "messages"
            }

//Configuration of 'login' table
const userConfig = { host : "https://facedetails.documents.azure.com:443/",
              authKey : "PzY25OijUuCcY61YzKzDZz3AN3wP1mNINCDEAecqyQMN6kT4xDDz6UUksgME2jKrzVj9iM2Q7EPRrNkzbxvSDg==",
              databaseId : "Login",
              collectionId : "login"
            }

//Export configurations for use by the models
module.exports = { roomConfig : roomConfig,
                   messageConfig : messageConfig,
                   userConfig : userConfig }
