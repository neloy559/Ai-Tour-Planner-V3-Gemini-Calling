#!/usr/bin/env node
/**
 * Gemini API Test
 * Tests both API keys for Gemini 2.0 Flash model
 */

const https = require('https');

const GEMINI_KEYS = {
  'Key A': 'AIzaSyAU6bMWdSqyHuQLY7VUEy_qnh6WCHEoikI',
  'Key B': 'AIzaSyBjxwK5Q7f1mf-SXdW9C75l7czBBYOOg3g'
};

const ENDPOINT = 'generativelanguage.googleapis.com';
const MODEL = 'gemini-2.0-flash';

const TEST_PROMPT = {
  contents: [{
    parts: [{
      text: "Generate a 1-day travel plan for Tokyo in JSON format with morning, afternoon, and evening activities."
    }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500,
  }
};

function makeGeminiRequest(apiKey) {
  return new Promise((resolve, reject) => {
    const path = `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    
    const options = {
      hostname: ENDPOINT,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
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
          body: data
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

    req.write(JSON.stringify(TEST_PROMPT));
    req.end();
  });
}

async function testGeminiKey(keyName, apiKey) {
  const startTime = Date.now();
  const result = {
    name: `Gemini API - ${keyName}`,
    status: 'pending',
    responseTime: 0,
    statusCode: null,
    error: null,
    details: {}
  };

  console.log(`\n🤖 Testing Gemini API (${keyName})...\n`);

  try {
    const response = await makeGeminiRequest(apiKey);
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.statusCode = response.statusCode;

    if (response.statusCode === 200) {
      const parsedBody = JSON.parse(response.body);
      result.status = 'success';
      result.details = {
        model: MODEL,
        responseLength: response.body.length,
        hasContent: !!(parsedBody.candidates && parsedBody.candidates[0]?.content?.parts?.[0]?.text),
        usage: parsedBody.usageMetadata || null
      };

      console.log(`✅ Gemini API (${keyName}): SUCCESS`);
      console.log(`   Response Time: ${result.responseTime}ms`);
      console.log(`   HTTP Status: ${response.statusCode}`);
      console.log(`   Model: ${MODEL}`);
      console.log(`   Response Length: ${response.body.length} bytes`);
      
      // Show preview of response
      if (parsedBody.candidates && parsedBody.candidates[0]?.content?.parts?.[0]?.text) {
        const preview = parsedBody.candidates[0].content.parts[0].text.substring(0, 150);
        console.log(`   Preview: "${preview}..."`);
      }
    } else {
      result.status = 'failed';
      const parsedBody = JSON.parse(response.body);
      result.error = parsedBody.error?.message || `HTTP ${response.statusCode}`;
      result.details = { rawResponse: response.body.substring(0, 500) };

      console.log(`❌ Gemini API (${keyName}): FAILED`);
      console.log(`   Response Time: ${result.responseTime}ms`);
      console.log(`   HTTP Status: ${response.statusCode}`);
      console.log(`   Error: ${result.error}`);
    }

  } catch (error) {
    const endTime = Date.now();
    result.responseTime = endTime - startTime;
    result.status = 'failed';
    result.error = error.message;

    console.log(`❌ Gemini API (${keyName}): FAILED`);
    console.log(`   Response Time: ${result.responseTime}ms`);
    console.log(`   Error: ${error.message}`);
  }

  return result;
}

async function testGemini() {
  const results = [];
  
  for (const [keyName, apiKey] of Object.entries(GEMINI_KEYS)) {
    const result = await testGeminiKey(keyName, apiKey);
    results.push(result);
    
    // Small delay between requests to avoid rate limiting
    if (keyName !== 'Key B') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Run if called directly
if (require.main === module) {
  testGemini().then(results => {
    const allSuccess = results.every(r => r.status === 'success');
    process.exit(allSuccess ? 0 : 1);
  });
}

module.exports = { testGemini, testGeminiKey };
