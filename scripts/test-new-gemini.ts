const TEST_API_KEY = 'AIzaSyDuZxhsEJWuq_VEAPuD_OfzZsJNqYbbxDk';
const GEMINI_MODEL = 'gemini-2.0-flash';

async function testGeminiKey() {
  console.log('Testing Gemini API Key...\n');
  console.log('API Key:', TEST_API_KEY.substring(0, 15) + '...');
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${TEST_API_KEY}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Say "Hello" in one word' }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.status === 429) {
      console.log('\n❌ FAILED: Got 429 Rate Limit Error');
      process.exit(1);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error Response:', errorText);
      console.log('\n❌ FAILED: API Error');
      process.exit(1);
    }

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      console.log('\n✅ SUCCESS: API Key is working!');
      process.exit(0);
    } else {
      console.log('\n❌ FAILED: Invalid response format');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    console.log('\n❌ FAILED: Exception occurred');
    process.exit(1);
  }
}

testGeminiKey();
