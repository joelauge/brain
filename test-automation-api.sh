#!/bin/bash

# Test script for N8N Automation API endpoint
# Usage: ./test-automation-api.sh [API_KEY]

API_KEY="${1:-test-api-key-12345}"
BASE_URL="http://localhost:3000"
ENDPOINT="${BASE_URL}/api/upload/automation"
TEST_FILE="test.xml"

echo "========================================="
echo "Testing N8N Automation API Endpoint"
echo "========================================="
echo ""

# Test 1: Health Check (GET)
echo "Test 1: Health Check (GET)"
echo "---------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "${ENDPOINT}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 2: POST without API key (should fail)
echo "Test 2: POST without API key (should fail with 401)"
echo "---------------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/xml" \
  --data-binary "@${TEST_FILE}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 3: POST with invalid API key (should fail)
echo "Test 3: POST with invalid API key (should fail with 401)"
echo "--------------------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/xml" \
  -H "X-API-Key: invalid-key" \
  --data-binary "@${TEST_FILE}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 4: POST with valid API key via X-API-Key header
echo "Test 4: POST with valid API key via X-API-Key header"
echo "----------------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/xml" \
  -H "X-API-Key: ${API_KEY}" \
  --data-binary "@${TEST_FILE}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 5: POST with API key via Authorization header
echo "Test 5: POST with API key via Authorization header"
echo "--------------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/xml" \
  -H "Authorization: Bearer ${API_KEY}" \
  --data-binary "@${TEST_FILE}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 6: POST with API key via query parameter
echo "Test 6: POST with API key via query parameter"
echo "----------------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}?apiKey=${API_KEY}" \
  -H "Content-Type: application/xml" \
  --data-binary "@${TEST_FILE}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 7: POST with multipart/form-data
echo "Test 7: POST with multipart/form-data"
echo "--------------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "X-API-Key: ${API_KEY}" \
  -F "file=@${TEST_FILE}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 8: POST with JSON + base64 encoded file
echo "Test 8: POST with JSON + base64 encoded file"
echo "--------------------------------------------"
base64_content=$(cat "${TEST_FILE}" | base64 | tr -d '\n')
json_payload=$(cat <<EOF
{
  "file": {
    "content": "${base64_content}",
    "filename": "test.xml"
  }
}
EOF
)
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${API_KEY}" \
  -d "${json_payload}")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Test 9: POST with non-XML file (should fail)
echo "Test 9: POST with non-XML file (should fail with 400)"
echo "------------------------------------------------------"
echo "test content" > /tmp/test.txt
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${ENDPOINT}" \
  -H "Content-Type: text/plain" \
  -H "X-API-Key: ${API_KEY}" \
  --data-binary "@/tmp/test.txt")
http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_STATUS/d')
echo "Status: $http_status"
echo "Response: $body" | jq '.' 2>/dev/null || echo "$body"
rm /tmp/test.txt
echo ""

echo "========================================="
echo "Testing Complete"
echo "========================================="
echo ""
echo "Note: For tests 4-8 to pass, you need to:"
echo "1. Set UPLOAD_API_KEY environment variable"
echo "2. Restart the dev server with: UPLOAD_API_KEY=${API_KEY} npm run dev"
echo ""

