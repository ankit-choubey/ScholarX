const mongoose = require('mongoose');

const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  let isMemory = false;

  if (!uri || uri.includes('<user>')) {
    console.log('Using in-memory MongoDB because real URI is missing/placeholder...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
    isMemory = true;
  }

  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}`);

  if (isMemory) {
    console.log('Automatically seeding in-memory database...');
    const seedData = require('../seed');
    await seedData();
  }
};

module.exports = connectDB;
