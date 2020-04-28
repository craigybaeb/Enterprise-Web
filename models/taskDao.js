// @ts-check
 const CosmosClient = require('@azure/cosmos').CosmosClient

console.log("DAOING")
 // For simplicity we'll set a constant partition key
 class TaskDao {
   /**
    * Manages reading, adding, and updating Tasks in Cosmos DB
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

   async find(querySpec) {
     console.log('Querying for items from the database')
     if (!this.container) {
       throw new Error('Collection is not initialized.')
     }
     const { resources } = await this.container.items.query(querySpec).fetchAll()
     return resources
   }

   async addItem(item) {
     console.log(`Adding item to the database`)
    //const item = {room:room}
    const { resource: doc } = await this.container.items.create(item);
    return doc;
   }

   async getItem(itemId) {
     console.log('Getting an item from the database')
     const { resource } = await this.container.item(itemId, partitionKey).read()
     return resource
   }

   async updateItem(querySpec, priv) {
     console.log('Update an item in the database')
     const doc = await this.find(querySpec)
     doc[0].priv = priv;

     const { resource: updated } = await this.container
       .item(doc[0].id, querySpec.parameters[0].value)
       .replace(doc[0])
     return updated
   }

   async deleteItem(querySpec) {
     console.log('Delete an item in the database')
     const doc = await this.find(querySpec)
     console.log("DOC")
     console.log(doc[0].id)
     const { resource: deleted } = await this.container
       .item(doc[0].id, querySpec.parameters[0].value)
       .delete()
     return deleted
   }
 }

 module.exports = TaskDao
