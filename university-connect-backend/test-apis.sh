#!/bin/bash

echo "🧪 Testing University Connect APIs..."
echo "================================="

BASE_URL="http://localhost:5000"
TOKEN="test-token-for-questions"

echo ""
echo "1. Testing MCQ/Coding Questions API..."
echo "GET ${BASE_URL}/api/certifications/questions?category=JavaScript"
response=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/certifications/questions?category=JavaScript")
if echo "$response" | grep -q '"_id"'; then
    echo "✅ Questions API working - found questions"
    question_count=$(echo "$response" | grep -o '"_id"' | wc -l)
    echo "   Found ${question_count} questions"
else
    echo "❌ Questions API failed"
    echo "   Response: $response"
fi

echo ""
echo "2. Testing Code Execution API..."
echo "POST ${BASE_URL}/api/code/execute"

# Get a coding question ID for testing
question_id=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/certifications/questions?category=JavaScript" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$question_id" ]; then
    echo "   Using question ID: $question_id"
    
    # Test with simple JavaScript code
    test_code='function twoSum(nums, target) { return [0, 1]; }'
    
    response=$(curl -s -H "Authorization: Bearer ${TOKEN}" \
                   -H "Content-Type: application/json" \
                   -d "{\"code\":\"$test_code\",\"language\":\"JavaScript\",\"questionId\":\"$question_id\",\"testCaseIndex\":0}" \
                   "${BASE_URL}/api/code/execute")
    
    if echo "$response" | grep -q '"success"'; then
        echo "✅ Code execution API working"
        echo "   Response preview: $(echo "$response" | head -c 100)..."
    else
        echo "❌ Code execution API failed"
        echo "   Response: $response"
    fi
else
    echo "⚠️  Could not get question ID for testing code execution"
fi

echo ""
echo "3. Testing Different Categories..."
categories=("JavaScript" "Python" "Java" "React" "Node.js")

for category in "${categories[@]}"; do
    response=$(curl -s -H "Authorization: Bearer ${TOKEN}" "${BASE_URL}/api/certifications/questions?category=${category}")
    if echo "$response" | grep -q '"_id"'; then
        count=$(echo "$response" | grep -o '"_id"' | wc -l)
        echo "✅ ${category}: ${count} questions"
    else
        echo "❌ ${category}: No questions found"
    fi
done

echo ""
echo "🎯 Test Summary Complete!"
echo "================================="
