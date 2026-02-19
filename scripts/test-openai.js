require('dotenv').config({ path: '.env.local' });

const path = require('path');

// Set up path aliases for the test
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@': path.join(__dirname, '..', 'src'),
});

// Mock Next.js module resolution
const originalRequire = require.extensions['.ts'];
require.extensions['.ts'] = function(module, filename) {
  if (filename.includes('node_modules')) {
    return originalRequire(module, filename);
  }
  // For our source files, we'll compile on the fly or use ts-node
};

async function runTest() {
  console.log('🚀 Testing OpenAI Service...\n');

  try {
    // Check if OPENAI_API_KEY is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    console.log('✅ OPENAI_API_KEY is configured');
    console.log(`   Key starts with: ${process.env.OPENAI_API_KEY.substring(0, 20)}...\n`);

    // Import the service (we'll need to handle TypeScript)
    const { generateTravelPlan } = require('../src/services/ai/openaiService');
    
    console.log('📤 Sending test prompt: "3 days in Tokyo"\n');
    
    const startTime = Date.now();
    const response = await generateTravelPlan('3 days in Tokyo');
    const duration = Date.now() - startTime;
    
    console.log(`✅ Response received in ${duration}ms\n`);
    
    // Validate response structure
    const requiredFields = ['title', 'summary', 'highlights', 'itinerary'];
    const missingFields = requiredFields.filter(field => !(field in response));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log('✅ All required fields present');
    console.log('   - title:', response.title);
    console.log('   - summary:', response.summary.substring(0, 100) + '...');
    console.log('   - highlights:', response.highlights.length, 'items');
    console.log('   - itinerary:', response.itinerary.length, 'days\n');
    
    // Validate itinerary structure
    if (!Array.isArray(response.itinerary) || response.itinerary.length === 0) {
      throw new Error('Itinerary is empty or not an array');
    }
    
    const firstDay = response.itinerary[0];
    if (!firstDay.day || !firstDay.title || !Array.isArray(firstDay.activities)) {
      throw new Error('Itinerary day structure is invalid');
    }
    
    console.log('✅ Itinerary structure is valid');
    console.log('   Day 1:', firstDay.title);
    console.log('   Activities:', firstDay.activities.length, 'items\n');
    
    // Print full response
    console.log('📋 Full Response:');
    console.log(JSON.stringify(response, null, 2));
    
    console.log('\n✅✅✅ ALL TESTS PASSED! ✅✅✅\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:\n');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
