const roomConfig = { host : "https://facedetails.documents.azure.com:443/",
               authKey : "PzY25OijUuCcY61YzKzDZz3AN3wP1mNINCDEAecqyQMN6kT4xDDz6UUksgME2jKrzVj9iM2Q7EPRrNkzbxvSDg==",
               databaseId : "Login",
               collectionId : "rooms"
             }

const messageConfig = { host : "https://facedetails.documents.azure.com:443/",
              authKey : "PzY25OijUuCcY61YzKzDZz3AN3wP1mNINCDEAecqyQMN6kT4xDDz6UUksgME2jKrzVj9iM2Q7EPRrNkzbxvSDg==",
              databaseId : "Login",
              collectionId : "messages"
            }

const userConfig = { host : "https://facedetails.documents.azure.com:443/",
              authKey : "PzY25OijUuCcY61YzKzDZz3AN3wP1mNINCDEAecqyQMN6kT4xDDz6UUksgME2jKrzVj9iM2Q7EPRrNkzbxvSDg==",
              databaseId : "Login",
              collectionId : "login"
            }

module.exports = { roomConfig : roomConfig,
                   messageConfig : messageConfig,
                   userConfig : userConfig }
