#!/usr/bin/env node
/**
 * Unsplash API Test
 * Tests fetching random images from Unsplash
 */

const https = require('https');

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || 'your_unsplash_access_key_here';
const ENDPOINT = 'api.unsplash.com';

function makeUnsplashRequest() {
  return new Promise((resolve, reject) => {
    // Search for Tokyo images
    const path = `/photos/random?query=Tokyo&orientation=landscape&count=1`;
    
    const options = {
      hostname: ENDPOINT,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          rateLimit: {
            limit: res.headers['x-ratelimit-limit'],
            remaining: res.headers['x-ratelimit-remaining']
          }
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testUnsplash() {
  const startTime = Date.now();
  const result = {
    name: 'Unsplash API',
    status: 'pending',
    responseTime: 0,
    statusCode: null,
    error: null,
    details: {}
  };

  console.log('\n📸 Testing Unsplash API...\n');

  try {
    const response = await makeUnsplashRequest();
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.statusCode = response.statusCode;

    if (response.statusCode === 200) {
      const parsedBody = JSON.parse(response.body);
      result.status = 'success';
      result.details = {
        imageId: parsedBody[0]?.id || parsedBody.id,
        imageUrl: parsedBody[0]?.urls?.regular || parsedBody.urls?.regular,
        description: parsedBody[0]?.description || parsedBody[0]?.alt_description || parsedBody.description || parsedBody.alt_description,
        photographer: parsedBody[0]?.user?.name || parsedBody.user?.name,
        rateLimit: response.rateLimit,
        responseSize: response.body.length
      };

      console.log('✅ Unsplash API: SUCCESS');
      console.log(`   Response Time: ${result.responseTime}ms`);
      console.log(`   HTTP Status: ${response.statusCode}`);
      console.log(`   Image ID: ${result.details.imageId}`);
      console.log(`   Photographer: ${result.details.photographer}`);
      console.log(`   Description: ${result.details.description?.substring(0, 60) || 'N/A'}...`);
      console.log(`   Rate Limit: ${response.rateLimit.remaining}/${response.rateLimit.limit} remaining`);
      console.log(`   Image URL: ${result.details.imageUrl?.substring(0, 80)}...`);
    } else {
      result.status = 'failed';
      let errorMessage = `HTTP ${response.statusCode}`;
      try {
        const parsedBody = JSON.parse(response.body);
        errorMessage = parsedBody.errors?.[0] || parsedBody.message || errorMessage;
      } catch (e) {
        errorMessage = response.body.substring(0, 200);
      }
      result.error = errorMessage;
      result.details = { 
        rateLimit: response.rateLimit,
        rawResponse: response.body.substring(0, 500) 
      };

      console.log('❌ Unsplash API: FAILED');
      console.log(`   Response Time: ${result.responseTime}ms`);
      console.log(`   HTTP Status: ${response.statusCode}`);
      console.log(`   Error: ${errorMessage}`);
      console.log(`   Rate Limit: ${response.rateLimit.remaining || 'N/A'}/${response.rateLimit.limit || 'N/A'} remaining`);
    }

  } catch (error) {
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.status = 'failed';
    result.error = error.message;

    console.log('❌ Unsplash API: FAILED');
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Error: ${error.message}`);
  }

  return result;
}

// Run if called directly
if (require.main === module) {
  testUnsplash().then(result => {
    process.exit(result.status === 'success' ? 0 : 1);
  });
}

module.exports = { testUnsplash };
