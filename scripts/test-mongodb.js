#!/usr/bin/env node
/**
 * MongoDB Connection Test
 * Tests connectivity to MongoDB Atlas cluster
 */

const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_uri_here';

async function testMongoDB() {
  const startTime = Date.now();
  const result = {
    name: 'MongoDB Atlas',
    status: 'pending',
    responseTime: 0,
    statusCode: null,
    error: null,
    details: {}
  };

  console.log('\n🔌 Testing MongoDB Atlas connection...\n');

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    await client.connect();
    
    // Ping the database
    await client.db('admin').command({ ping: 1 });
    
    // Get server info
    const serverInfo = await client.db('admin').admin().serverInfo();
    const databases = await client.db().admin().listDatabases();
    
    await client.close();

    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.status = 'success';
    result.statusCode = 200;
    result.details = {
      version: serverInfo.version,
      databases: databases.databases.map(db => db.name).join(', '),
      serverTime: new Date().toISOString()
    };

    console.log('✅ MongoDB Connection: SUCCESS');
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   MongoDB Version: ${serverInfo.version}`);
    console.log(`   Available Databases: ${databases.databases.length}`);
    console.log(`   Server Time: ${result.details.serverTime}`);

  } catch (error) {
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.status = 'failed';
    result.error = error.message;
    result.statusCode = error.code || 'N/A';

    console.log('❌ MongoDB Connection: FAILED');
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Error: ${error.message}`);
    if (error.code) console.log(`   Error Code: ${error.code}`);
  }

  return result;
}

// Run if called directly
if (require.main === module) {
  testMongoDB().then(result => {
    process.exit(result.status === 'success' ? 0 : 1);
  });
}

module.exports = { testMongoDB };
