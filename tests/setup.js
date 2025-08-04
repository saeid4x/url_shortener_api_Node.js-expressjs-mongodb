const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// This will run once before all tests
beforeAll(async () => {
    // Create a new in-memory database server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect mongoose to the in-memory database
    await mongoose.connect(mongoUri);
});

// This will run once after all tests
afterAll(async () => {
    // Disconnect mongoose and stop the server
    await mongoose.disconnect();
    await mongoServer.stop();
});

// This will run before each test
beforeEach(async () => {
    // Clear all data from all collections before each test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});