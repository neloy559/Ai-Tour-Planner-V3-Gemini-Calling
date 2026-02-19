# API Connection Test Results

**Test Date:** 2/19/2026, 7:26:44 PM  
**Environment:** Next.js Project  
**Test Suite:** Comprehensive API Connectivity Tests

---

## 📋 Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 4 |
| **Passed** | 1 ✅ |
| **Failed** | 3 ❌ |
| **Success Rate** | 25.0% |
| **Overall Status** | 🟡 Partial Outage |

---

## 📊 Detailed Test Results

### 1. MongoDB Atlas Connection

| Attribute | Value |
|-----------|-------|
| **Status** | ❌ FAIL |
| **Response Time** | 12ms |
| **Connection String** | mongodb+srv://****@smarttravelplanner01... |
| **Database Version** | N/A |

**Error:** querySrv ECONNREFUSED _mongodb._tcp.smarttravelplanner01.qj8jn1f.mongodb.net

---

### 2. Gemini API Tests

#### Key A (AIzaSyAU6bMWdSqyHuQLY7VUEy_qnh6WCHEoikI)

| Attribute | Value |
|-----------|-------|
| **Status** | ❌ FAIL |
| **Response Time** | 290ms |
| **HTTP Status** | 429 |
| **Model** | gemini-2.0-flash |

**Error:** You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
Please retry in 12.044187539s.

#### Key B (AIzaSyBjxwK5Q7f1mf-SXdW9C75l7czBBYOOg3g)

| Attribute | Value |
|-----------|-------|
| **Status** | ❌ FAIL |
| **Response Time** | 116ms |
| **HTTP Status** | 429 |
| **Model** | gemini-2.0-flash |

**Error:** You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-2.0-flash
Please retry in 10.909622741s.

---

### 3. Unsplash API

| Attribute | Value |
|-----------|-------|
| **Status** | ✅ PASS |
| **Response Time** | 519ms |
| **HTTP Status** | 200 |
| **Rate Limit Remaining** | 49 |



---

## 🎯 Final Recommendations

### Gemini API Key Selection

❌ **Neither API key is working** - Please check your API credentials


⚠️ **Non-working keys:**
- Gemini API - Key A: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
Please retry in 12.044187539s.
- Gemini API - Key B: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. 
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 0, model: gemini-2.0-flash
* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_input_token_count, limit: 0, model: gemini-2.0-flash
Please retry in 10.909622741s.

### Next Steps

1. ❌ Some tests failed. Please review the error messages above.
2. Contact Google Cloud support to resolve API key issues.
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
