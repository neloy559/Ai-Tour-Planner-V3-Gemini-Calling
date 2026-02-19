import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import https from 'https';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';
const ENDPOINT = 'generativelanguage.googleapis.com';
const TEST_PROMPT = '3 days in Tokyo';

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('🔑 Using GEMINI_API_KEY:', GEMINI_API_KEY.substring(0, 10) + '...');
console.log('🧪 Testing prompt:', TEST_PROMPT);
console.log('---\n');

const startTime = Date.now();

const requestBody = {
  contents: [{
    parts: [{ text: TEST_PROMPT }]
  }],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 500,
  }
};

function makeRequest(): Promise<{ statusCode: number; body: string; headers: any }> {
  return new Promise((resolve, reject) => {
    const path = `/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
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
          statusCode: res.statusCode || 0,
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

    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function testGemini() {
  try {
    const response = await makeRequest();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log('📊 Response Time:', responseTime, 'ms');
    console.log('📊 HTTP Status Code:', response.statusCode);

    if (response.statusCode === 429) {
      console.log('\n❌ 429 ERROR DETECTED!');
      console.log('Rate limit hit - too many requests');
    }

    if (response.statusCode === 200) {
      console.log('\n✅ SUCCESS - API call succeeded');
      const parsed = JSON.parse(response.body);
      if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = parsed.candidates[0].content.parts[0].text;
        console.log('📝 Response preview:', text.substring(0, 200) + '...');
      }
    } else {
      console.log('\n❌ FAILED');
      console.log('Error response:', response.body.substring(0, 500));
    }

    console.log('\n--- Full Results ---');
    console.log('API call succeeded:', response.statusCode === 200);
    console.log('429 error returned:', response.statusCode === 429);
    console.log('Response time:', responseTime + 'ms');
    if (response.statusCode !== 200) {
      console.log('Full error message:', response.body);
    }

  } catch (error: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('\n❌ REQUEST FAILED');
    console.log('Response time:', responseTime, 'ms');
    console.log('Error message:', error.message);
    
    if (error.message.includes('429')) {
      console.log('⚠️  429 error detected in error message');
    }
  }
}

testGemini();
