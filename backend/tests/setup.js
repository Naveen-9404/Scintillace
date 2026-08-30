import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";

const originalGet = express.request.get;
express.request.get = function (header) {
  if (header.toLowerCase() === "origin") {
    return "http://localhost:5173";
  }
  return originalGet.call(this, header);
};

let replSet;

beforeAll(async () => {
  // Start the in-memory ReplSet
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  
  const uri = replSet.getUri();

  // Connect mongoose to the in-memory db directly
  await mongoose.connect(uri, {
    maxPoolSize: 10,
  });

  // Ensure collections are created and indexes are built before tests run.
  // This prevents MongoDB "catalog changes" errors during concurrent test execution.
  const models = Object.values(mongoose.models);
  for (const model of models) {
    await model.createCollection();
    await model.syncIndexes();
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (replSet) {
    await replSet.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
