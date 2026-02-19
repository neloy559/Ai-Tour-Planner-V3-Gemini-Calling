// Test script for Hugging Face Inference API
// Usage: tsx scripts/test-huggingface.ts

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '..', '.env.local') });

interface ValidationResult {
  success: boolean;
  errors: string[];
}

function validateResponse(response: any): ValidationResult {
  const errors: string[] = [];

  if (!response) {
    return { success: false, errors: ['Response is null or undefined'] };
  }

  // Check title
  if (!response.title || typeof response.title !== 'string') {
    errors.push('Missing or invalid "title" field');
  }

  // Check summary
  if (!response.summary || typeof response.summary !== 'string') {
    errors.push('Missing or invalid "summary" field');
  }

  // Check highlights
  if (!Array.isArray(response.highlights)) {
    errors.push('Missing or invalid "highlights" field (must be an array)');
  } else if (response.highlights.length === 0) {
    errors.push('"highlights" array is empty');
  } else {
    for (let i = 0; i < response.highlights.length; i++) {
      if (typeof response.highlights[i] !== 'string') {
        errors.push(`Invalid highlight at index ${i}: must be a string`);
      }
    }
  }

  // Check itinerary
  if (!Array.isArray(response.itinerary)) {
    errors.push('Missing or invalid "itinerary" field (must be an array)');
  } else if (response.itinerary.length === 0) {
    errors.push('"itinerary" array is empty');
  } else {
    for (let i = 0; i < response.itinerary.length; i++) {
      const day = response.itinerary[i];
      if (!day || typeof day !== 'object') {
        errors.push(`Invalid itinerary day at index ${i}`);
        continue;
      }
      if (typeof day.day !== 'number') {
        errors.push(`Invalid "day" field in itinerary at index ${i}`);
      }
      if (!day.title || typeof day.title !== 'string') {
        errors.push(`Invalid "title" field in itinerary at index ${i}`);
      }
      if (!Array.isArray(day.activities)) {
        errors.push(`Invalid "activities" field in itinerary at index ${i}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

async function runTest(): Promise<void> {
  console.log('==============================================');
  console.log('Hugging Face Inference API Test');
  console.log('==============================================\n');

  // Verify API key is set
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.error('ERROR: HUGGINGFACE_API_KEY is not set in .env.local');
    console.error('Please add: HUGGINGFACE_API_KEY=your_api_key_here');
    process.exit(1);
  }

  console.log('API Key: Found (masked for security)');
  console.log(`Key length: ${apiKey.length} characters\n`);

  const testPrompt = '3 days in Tokyo';
  console.log(`Test prompt: "${testPrompt}"\n`);

  // Dynamically import the service after dotenv is configured
  let generateTravelPlan: (prompt: string) => Promise<any>;
  try {
    const module = await import('../src/services/ai/huggingfaceService.js');
    generateTravelPlan = module.generateTravelPlan;
  } catch (importError) {
    console.error('ERROR: Failed to import huggingfaceService');
    console.error(importError);
    process.exit(1);
  }

  try {
    console.log('Calling Hugging Face API...');
    console.log('This may take 10-30 seconds depending on the model...\n');

    const startTime = Date.now();
    const response = await generateTravelPlan(testPrompt);
    const duration = Date.now() - startTime;

    console.log(`✅ API call completed in ${duration}ms\n`);

    // Validate response structure
    const validation = validateResponse(response);

    if (!validation.success) {
      console.error('❌ VALIDATION FAILED');
      console.error('Errors:');
      validation.errors.forEach(err => console.error(`  - ${err}`));
      console.log('\nRaw response:');
      console.log(JSON.stringify(response, null, 2));
      process.exit(1);
    }

    console.log('✅ VALIDATION PASSED\n');
    console.log('Response Structure:');
    console.log('-------------------');
    console.log(`Title: ${response.title}`);
    console.log(`Summary: ${response.summary}`);
    console.log(`Highlights: ${response.highlights.length} items`);
    console.log(`Itinerary: ${response.itinerary.length} days\n`);

    console.log('Sample Response Data:');
    console.log('---------------------');
    console.log(JSON.stringify(response, null, 2));

    console.log('\n==============================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('==============================================');
    console.log('\nHugging Face Inference API is working correctly!');
    console.log('The migration from GLM to Hugging Face is complete.');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('---------------');
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (error.stack) {
        console.error(`Stack: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
    } else {
      console.error('Unknown error:', error);
    }

    console.log('\n==============================================');
    console.log('TROUBLESHOOTING TIPS:');
    console.log('==============================================');
    console.log('1. Check your internet connection');
    console.log('2. Verify HUGGINGFACE_API_KEY is correct');
    console.log('3. The model might be loading (try again in a few minutes)');
    console.log('4. You may have hit rate limits (wait a few minutes)');
    console.log('5. Check if the model is available: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2');
    
    process.exit(1);
  }
}

// Run the test
runTest();
