/* This module provides the server with a model to communicate with the CosmosDB */

//Import the modules
const CosmosClient = require('@azure/cosmos').CosmosClient

class TaskDao {
 /**
  * Manages items in Cosmos DB
  * @param {CosmosClient} cosmosClient
  * @param {string} databaseId
  * @param {string} containerId
  * @param {string} partitionKey
  */
 constructor(cosmosClient, databaseId, containerId, partitionKey) {
   this.client = cosmosClient
   this.databaseId = databaseId
   this.collectionId = containerId
   this.partitionKey = partitionKey

   this.database = null
   this.container = null
 }

 //Initialise the DAO
 async init() {
   console.log('Setting up the database...')
   const dbResponse = await this.client.databases.createIfNotExists({
     id: this.databaseId
   })
   this.database = dbResponse.database
   console.log('Setting up the database...done!')
   console.log('Setting up the container...')
   const coResponse = await this.database.containers.createIfNotExists({
     id: this.collectionId
   })
   this.container = coResponse.container
   console.log('Setting up the container...done!')
 }

 //Get all items matching query from database
 async find(querySpec) {
   const { resources } = await this.container.items.query(querySpec).fetchAll(); //Execute the query
   return resources; //Return items found in query
 }

 //Add an item to the database
 async addItem(item) {
   const { resource: doc } = await this.container.items.create(item); //Add the item
   return doc; //Return the saved item on success or null on failure
 }

 //Add an item to the database if one matching the query does not already exist
 async addItemIfNotExists(querySpec, item) {

   //Check if item exists
   const exists = await this.find(querySpec); //Execute the query

   //Add item if does not exist
   if(exists.length){ //Item exists
     return false; //Inform controller that item exists

   }else{ //Item does not exist

     //Add the item
     const { resource: doc } = await this.container.items.create(item);
     return doc; //Return the saved item on success or null on failure
   } //End-if
 } //End addItemIfNotExists()

 //Update an item in the database
 async updateItem(querySpec, priv) {

   //Get the item to update from the database
   const doc = await this.find(querySpec); //Execute query

   //Check if item exists
   if(doc.length){ //Item exists

     //Modify the item to update it
     doc[0].priv = priv; //Changing the privilege

     //Execute the update
     const { resource: updated } = await this.container
       .item(doc[0].id, querySpec.parameters[0].value) //PartitionKey is extracted from querySpec
       .replace(doc[0]); //Replace the old item with the new one

     //Inform controller of success / failure
     return updated;  //Updated item on success or null on failure

   }else{ //Item does not exist
     return false; //Cannot be updated, inform controller
   } //End-if
 } //End updateItem()

 //Delete an item from the database
 async deleteItem(querySpec) {

   //Get the item to delete from the database
   const doc = await this.find(querySpec) //Execute the query

   //Check if item exists
   if(doc.length){ //Item exists

     //Delete the fetched item
     const { resource: failed } = await this.container
       .item(doc[0].id, querySpec.parameters[0].value) //PartitionKey is extracted from querySpec
       .delete(); //Delete the item

     return !failed; //Informs controller of success/failure of operation
 }else{ //Item does not exist
   return false; //Cannot be deleted
 }
 } //End deleteItem()
 
} //End TaskDao

 module.exports = TaskDao //Export the model (TaskDao) for use by the controllers
