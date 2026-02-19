#!/usr/bin/env node
/**
 * Master API Test Script
 * Runs all API tests and generates comprehensive report
 */

const { testMongoDB } = require('./test-mongodb');
const { testGemini } = require('./test-gemini');
const { testUnsplash } = require('./test-unsplash');

const fs = require('fs');
const path = require('path');

async function runAllTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 COMPREHENSIVE API CONNECTION TEST SUITE');
  console.log('='.repeat(80));
  console.log(`Started at: ${new Date().toISOString()}`);
  console.log('');

  const allResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };

  // Test 1: MongoDB
  console.log('\n' + '-'.repeat(80));
  console.log('TEST 1/4: MongoDB Atlas Connection');
  console.log('-'.repeat(80));
  try {
    const mongoResult = await testMongoDB();
    allResults.tests.push(mongoResult);
  } catch (error) {
    allResults.tests.push({
      name: 'MongoDB Atlas',
      status: 'failed',
      error: error.message,
      responseTime: 0
    });
  }

  // Test 2 & 3: Gemini API Keys
  console.log('\n' + '-'.repeat(80));
  console.log('TEST 2-3/4: Gemini API (Both Keys)');
  console.log('-'.repeat(80));
  try {
    const geminiResults = await testGemini();
    allResults.tests.push(...geminiResults);
  } catch (error) {
    allResults.tests.push({
      name: 'Gemini API Tests',
      status: 'failed',
      error: error.message,
      responseTime: 0
    });
  }

  // Test 4: Unsplash API
  console.log('\n' + '-'.repeat(80));
  console.log('TEST 4/4: Unsplash API');
  console.log('-'.repeat(80));
  try {
    const unsplashResult = await testUnsplash();
    allResults.tests.push(unsplashResult);
  } catch (error) {
    allResults.tests.push({
      name: 'Unsplash API',
      status: 'failed',
      error: error.message,
      responseTime: 0
    });
  }

  // Calculate summary
  allResults.summary.total = allResults.tests.length;
  allResults.summary.passed = allResults.tests.filter(t => t.status === 'success').length;
  allResults.summary.failed = allResults.tests.filter(t => t.status === 'failed').length;
  allResults.summary.successRate = ((allResults.summary.passed / allResults.summary.total) * 100).toFixed(1);

  // Generate Report
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  
  allResults.tests.forEach(test => {
    const icon = test.status === 'success' ? '✅' : '❌';
    const time = test.responseTime > 0 ? `${test.responseTime}ms` : 'N/A';
    console.log(`${icon} ${test.name.padEnd(35)} | ${test.status.toUpperCase().padEnd(7)} | ${time}`);
  });

  console.log('\n' + '-'.repeat(80));
  console.log(`Total Tests: ${allResults.summary.total}`);
  console.log(`Passed: ${allResults.summary.passed} ✅`);
  console.log(`Failed: ${allResults.summary.failed} ❌`);
  console.log(`Success Rate: ${allResults.summary.successRate}%`);
  console.log('-'.repeat(80));

  // Generate Markdown Report
  const report = generateReport(allResults);
  const reportPath = path.join(__dirname, '..', 'TEST-RESULTS.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n📝 Full report saved to: ${reportPath}`);

  console.log('\n' + '='.repeat(80));
  console.log('✨ Test Suite Complete');
  console.log('='.repeat(80) + '\n');

  return allResults;
}

function generateReport(results) {
  const geminiTests = results.tests.filter(t => t.name.includes('Gemini'));
  const workingGeminiKey = geminiTests.find(t => t.status === 'success');
  const failedGeminiKeys = geminiTests.filter(t => t.status === 'failed');

  return `# API Connection Test Results

**Test Date:** ${new Date(results.timestamp).toLocaleString()}  
**Environment:** Next.js Project  
**Test Suite:** Comprehensive API Connectivity Tests

---

## 📋 Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | ${results.summary.total} |
| **Passed** | ${results.summary.passed} ✅ |
| **Failed** | ${results.summary.failed} ❌ |
| **Success Rate** | ${results.summary.successRate}% |
| **Overall Status** | ${results.summary.failed === 0 ? '🟢 All Systems Operational' : results.summary.failed === results.summary.total ? '🔴 Critical Failures' : '🟡 Partial Outage'} |

---

## 📊 Detailed Test Results

### 1. MongoDB Atlas Connection

| Attribute | Value |
|-----------|-------|
| **Status** | ${results.tests.find(t => t.name === 'MongoDB Atlas')?.status === 'success' ? '✅ PASS' : '❌ FAIL'} |
| **Response Time** | ${results.tests.find(t => t.name === 'MongoDB Atlas')?.responseTime}ms |
| **Connection String** | mongodb+srv://\*\*\*\*@smarttravelplanner01... |
| **Database Version** | ${results.tests.find(t => t.name === 'MongoDB Atlas')?.details?.version || 'N/A'} |

${results.tests.find(t => t.name === 'MongoDB Atlas')?.status === 'failed' ? `**Error:** ${results.tests.find(t => t.name === 'MongoDB Atlas')?.error}` : ''}

---

### 2. Gemini API Tests

#### Key A (AIzaSyAU6bMWdSqyHuQLY7VUEy_qnh6WCHEoikI)

| Attribute | Value |
|-----------|-------|
| **Status** | ${results.tests.find(t => t.name === 'Gemini API - Key A')?.status === 'success' ? '✅ PASS' : '❌ FAIL'} |
| **Response Time** | ${results.tests.find(t => t.name === 'Gemini API - Key A')?.responseTime}ms |
| **HTTP Status** | ${results.tests.find(t => t.name === 'Gemini API - Key A')?.statusCode || 'N/A'} |
| **Model** | gemini-2.0-flash |

${results.tests.find(t => t.name === 'Gemini API - Key A')?.status === 'failed' ? `**Error:** ${results.tests.find(t => t.name === 'Gemini API - Key A')?.error}` : ''}

#### Key B (AIzaSyBjxwK5Q7f1mf-SXdW9C75l7czBBYOOg3g)

| Attribute | Value |
|-----------|-------|
| **Status** | ${results.tests.find(t => t.name === 'Gemini API - Key B')?.status === 'success' ? '✅ PASS' : '❌ FAIL'} |
| **Response Time** | ${results.tests.find(t => t.name === 'Gemini API - Key B')?.responseTime}ms |
| **HTTP Status** | ${results.tests.find(t => t.name === 'Gemini API - Key B')?.statusCode || 'N/A'} |
| **Model** | gemini-2.0-flash |

${results.tests.find(t => t.name === 'Gemini API - Key B')?.status === 'failed' ? `**Error:** ${results.tests.find(t => t.name === 'Gemini API - Key B')?.error}` : ''}

---

### 3. Unsplash API

| Attribute | Value |
|-----------|-------|
| **Status** | ${results.tests.find(t => t.name === 'Unsplash API')?.status === 'success' ? '✅ PASS' : '❌ FAIL'} |
| **Response Time** | ${results.tests.find(t => t.name === 'Unsplash API')?.responseTime}ms |
| **HTTP Status** | ${results.tests.find(t => t.name === 'Unsplash API')?.statusCode || 'N/A'} |
| **Rate Limit Remaining** | ${results.tests.find(t => t.name === 'Unsplash API')?.details?.rateLimit?.remaining || 'N/A'} |

${results.tests.find(t => t.name === 'Unsplash API')?.status === 'failed' ? `**Error:** ${results.tests.find(t => t.name === 'Unsplash API')?.error}` : ''}

---

## 🎯 Final Recommendations

### Gemini API Key Selection

${workingGeminiKey ? `✅ **Recommended Key:** ${workingGeminiKey.name.split(' - ')[1]}  
**Key:** \`${workingGeminiKey.name.includes('Key A') ? 'AIzaSyAU6bMWdSqyHuQLY7VUEy_qnh6WCHEoikI' : 'AIzaSyBjxwK5Q7f1mf-SXdW9C75l7czBBYOOg3g'}\`` : '❌ **Neither API key is working** - Please check your API credentials'}

${failedGeminiKeys.length > 0 ? `\n⚠️ **Non-working keys:**\n${failedGeminiKeys.map(k => `- ${k.name}: ${k.error}`).join('\n')}` : ''}

### Next Steps

1. ${results.summary.failed === 0 ? '✅ All APIs are functioning correctly. You can proceed with development.' : '❌ Some tests failed. Please review the error messages above.'}
2. ${workingGeminiKey ? `Use ${workingGeminiKey.name.split(' - ')[1]} for all Gemini API integrations.` : 'Contact Google Cloud support to resolve API key issues.'}
3. Monitor API rate limits, especially for Unsplash (50 requests/hour for demo apps).
4. Store all API keys securely using environment variables.

---

## 🔧 Troubleshooting

### Common Issues

**MongoDB Connection Errors:**
- Verify IP whitelist in MongoDB Atlas Network Access
- Check username/password credentials
- Ensure cluster is not in maintenance mode

**Gemini API Errors:**
- Verify API key is active in Google Cloud Console
- Check if billing is enabled for the project
- Ensure the model name is correct (gemini-2.0-flash)

**Unsplash API Errors:**
- Verify access key is valid
- Check rate limit status
- Ensure query parameters are valid

---

*Report generated automatically by API Test Suite*  
*For support, contact the development team*
`;
}

// Run if called directly
if (require.main === module) {
  runAllTests().then(results => {
    const exitCode = results.summary.failed === 0 ? 0 : 1;
    process.exit(exitCode);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
