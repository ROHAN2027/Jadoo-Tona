#!/bin/bash

# Test script for GitHub Project Interview API

echo "🧪 Testing GitHub Project Interview API"
echo "========================================"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing health endpoint..."
curl -s http://localhost:8000/health | jq '.'
echo ""
echo ""

# Test 2: Generate Project Interview
echo "2️⃣ Testing project interview generation..."
echo "Repository: https://github.com/ROHAN2027/Jadoo-Tona"
echo ""

curl -X POST http://localhost:8000/generate-project-interview \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/ROHAN2027/Jadoo-Tona"}' \
  | jq '.'

echo ""
echo ""
echo "✅ Test complete! Check the output above for results."
